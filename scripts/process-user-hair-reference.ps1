param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.Rectangle $x, $y, $w, $h
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
$alpha = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$minX = $source.Width
$minY = $source.Height
$maxX = -1
$maxY = -1

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    $pixel = $source.GetPixel($x, $y)
    $isBackground = $pixel.R -gt 225 -and $pixel.G -gt 225 -and $pixel.B -gt 225

    if ($isBackground) {
      $alpha.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      continue
    }

    $alpha.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $pixel.R, $pixel.G, $pixel.B))
    if ($pixel.A -gt 12) {
      $minX = [Math]::Min($minX, $x)
      $minY = [Math]::Min($minY, $y)
      $maxX = [Math]::Max($maxX, $x)
      $maxY = [Math]::Max($maxY, $y)
    }
  }
}

if ($maxX -lt $minX -or $maxY -lt $minY) {
  throw "No hair pixels found."
}

$padding = 3
$cropX = [Math]::Max(0, $minX - $padding)
$cropY = [Math]::Max(0, $minY - $padding)
$cropW = [Math]::Min($source.Width - $cropX, ($maxX - $minX + 1) + $padding * 2)
$cropH = [Math]::Min($source.Height - $cropY, ($maxY - $minY + 1) + $padding * 2)
$crop = Rect $cropX $cropY $cropW $cropH

$canvasWidth = 420
$canvasHeight = 620
$hairTop = 28
$hairLeft = 155
$scaleDivisor = 1.96
$targetWidth = [Math]::Max(1, [Math]::Round($cropW / $scaleDivisor))
$targetHeight = [Math]::Max(1, [Math]::Round($cropH / $scaleDivisor))

$canvas = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.DrawImage($alpha, (Rect $hairLeft $hairTop $targetWidth $targetHeight), $crop, [System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()

$tempPath = "$OutputPath.tmp.png"
$canvas.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose()
$alpha.Dispose()
$source.Dispose()

if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}
Move-Item -Force -LiteralPath $tempPath -Destination $OutputPath
