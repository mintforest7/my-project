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
    $greenDominance = $pixel.G - [Math]::Max($pixel.R, $pixel.B)
    $isKey = $pixel.G -gt 95 -and $greenDominance -gt 45

    if ($isKey) {
      $alpha.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      continue
    }

    $red = $pixel.R
    $green = [Math]::Min($pixel.G, [Math]::Round(($pixel.R + $pixel.B) / 2))
    $blue = $pixel.B
    $alpha.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $red, $green, $blue))

    if ($pixel.A -gt 12) {
      $minX = [Math]::Min($minX, $x)
      $minY = [Math]::Min($minY, $y)
      $maxX = [Math]::Max($maxX, $x)
      $maxY = [Math]::Max($maxY, $y)
    }
  }
}

if ($maxX -lt $minX -or $maxY -lt $minY) {
  throw "No hair pixels found after background removal."
}

$sourceCrop = Rect $minX $minY ($maxX - $minX + 1) ($maxY - $minY + 1)
$canvasWidth = 420
$canvasHeight = 620
$hairTop = 5
$targetWidth = 250
$targetHeight = [Math]::Round($sourceCrop.Height * ($targetWidth / $sourceCrop.Width))
$targetLeft = [Math]::Round(($canvasWidth - $targetWidth) / 2)

$canvas = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.DrawImage($alpha, (Rect $targetLeft $hairTop $targetWidth $targetHeight), $sourceCrop, [System.Drawing.GraphicsUnit]::Pixel)
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
