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
$crop = Rect 330 325 360 520
$alpha = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$minX = $crop.Width
$minY = $crop.Height
$maxX = -1
$maxY = -1

for ($y = 0; $y -lt $crop.Height; $y++) {
  for ($x = 0; $x -lt $crop.Width; $x++) {
    $pixel = $source.GetPixel($crop.X + $x, $crop.Y + $y)
    $maxChannel = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
    $minChannel = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
    $saturation = $maxChannel - $minChannel
    $isWarmHair = $pixel.R -gt 58 -and $pixel.R -gt ($pixel.G + 7) -and $pixel.G -gt ($pixel.B + 4) -and $saturation -gt 18
    $isHighlight = $pixel.R -gt 118 -and $pixel.G -gt 72 -and $pixel.B -lt 72 -and $pixel.R -gt $pixel.B * 1.45

    if (-not ($isWarmHair -or $isHighlight)) {
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

$padding = 8
$hairCropX = [Math]::Max(0, $minX - $padding)
$hairCropY = [Math]::Max(0, $minY - $padding)
$hairCropW = [Math]::Min($crop.Width - $hairCropX, ($maxX - $minX + 1) + $padding * 2)
$hairCropH = [Math]::Min($crop.Height - $hairCropY, ($maxY - $minY + 1) + $padding * 2)

$canvasWidth = 420
$canvasHeight = 620
$targetW = 180
$targetH = [Math]::Round($hairCropH * ($targetW / $hairCropW))
$targetX = [Math]::Round(($canvasWidth - $targetW) / 2)
$targetY = 33

$canvas = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.DrawImage($alpha, (Rect $targetX $targetY $targetW $targetH), (Rect $hairCropX $hairCropY $hairCropW $hairCropH), [System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()

$tempPath = "$OutputPath.tmp.png"
$canvas.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose()
$alpha.Dispose()
$source.Dispose()

Copy-Item -LiteralPath $tempPath -Destination $OutputPath -Force
Remove-Item -LiteralPath $tempPath -Force
