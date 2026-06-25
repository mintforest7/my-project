param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath,
  [double]$Scale = 0.72,
  [switch]$RemoveGrayArtifacts
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
    $nearWhite = $pixel.R -gt 214 -and $pixel.G -gt 214 -and $pixel.B -gt 214
    $lowColor = ([Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B)) - [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))) -lt 18

    $grayArtifact = $RemoveGrayArtifacts -and $lowColor -and $pixel.R -lt 190

    if (($nearWhite -and $lowColor) -or $grayArtifact) {
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
  throw "No visible item pixels found."
}

$padding = 4
$cropX = [Math]::Max(0, $minX - $padding)
$cropY = [Math]::Max(0, $minY - $padding)
$cropW = [Math]::Min($source.Width - $cropX, ($maxX - $minX + 1) + $padding * 2)
$cropH = [Math]::Min($source.Height - $cropY, ($maxY - $minY + 1) + $padding * 2)
$targetW = [Math]::Max(1, [Math]::Round($cropW * $Scale))
$targetH = [Math]::Max(1, [Math]::Round($cropH * $Scale))

$output = New-Object System.Drawing.Bitmap $targetW, $targetH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($output)
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.DrawImage($alpha, (Rect 0 0 $targetW $targetH), (Rect $cropX $cropY $cropW $cropH), [System.Drawing.GraphicsUnit]::Pixel)
$graphics.Dispose()

$tempPath = "$OutputPath.tmp.png"
$output.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$output.Dispose()
$alpha.Dispose()
$source.Dispose()

if (Test-Path -LiteralPath $OutputPath) {
  Copy-Item -LiteralPath $tempPath -Destination $OutputPath -Force
  Remove-Item -LiteralPath $tempPath -Force
} else {
  Move-Item -Force -LiteralPath $tempPath -Destination $OutputPath
}
