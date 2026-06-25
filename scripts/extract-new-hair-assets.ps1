Add-Type -AssemblyName System.Drawing

$root = Join-Path (Get-Location) "public/assets/style-rush"
$sourcePath = Join-Path $root "hair-reference-2026-06-23.png"
$outputRoot = Join-Path $root "hair"

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.Rectangle $x, $y, $w, $h
}

function Remove-Background($bitmap) {
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $pixel = $bitmap.GetPixel($x, $y)
      $isCheckerOrWhite = $pixel.R -gt 205 -and $pixel.G -gt 205 -and $pixel.B -gt 205 -and ([Math]::Abs($pixel.R - $pixel.G) -lt 18) -and ([Math]::Abs($pixel.G - $pixel.B) -lt 18)
      if ($isCheckerOrWhite) {
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }
}

function Trim-Transparent($bitmap) {
  $minX = $bitmap.Width
  $minY = $bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -eq 0) { continue }
      $minX = [Math]::Min($minX, $x)
      $minY = [Math]::Min($minY, $y)
      $maxX = [Math]::Max($maxX, $x)
      $maxY = [Math]::Max($maxY, $y)
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return New-Object System.Drawing.Bitmap 1, 1, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  }

  $padding = 4
  $crop = Rect `
    ([Math]::Max(0, $minX - $padding)) `
    ([Math]::Max(0, $minY - $padding)) `
    ([Math]::Min($bitmap.Width - [Math]::Max(0, $minX - $padding), ($maxX - $minX + 1) + $padding * 2)) `
    ([Math]::Min($bitmap.Height - [Math]::Max(0, $minY - $padding), ($maxY - $minY + 1) + $padding * 2))

  $trimmed = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($trimmed)
  $graphics.DrawImage($bitmap, (Rect 0 0 $crop.Width $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()
  return $trimmed
}

function Export-Hair($source, $name, $crop) {
  $cropped = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($cropped)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.DrawImage($source, (Rect 0 0 $crop.Width $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  Remove-Background $cropped
  $trimmed = Trim-Transparent $cropped

  $canvasWidth = 420
  $canvasHeight = 620
  $hairTop = 5
  $hairTargetWidth = 250
  $hairTargetHeight = [Math]::Round($trimmed.Height * ($hairTargetWidth / $trimmed.Width))
  $hairLeft = [Math]::Round(($canvasWidth - $hairTargetWidth) / 2) + 8
  $framed = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $frameGraphics = [System.Drawing.Graphics]::FromImage($framed)
  $frameGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $frameGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $frameGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $frameGraphics.DrawImage($trimmed, (Rect $hairLeft $hairTop $hairTargetWidth $hairTargetHeight), (Rect 0 0 $trimmed.Width $trimmed.Height), [System.Drawing.GraphicsUnit]::Pixel)
  $frameGraphics.Dispose()

  $outPath = Join-Path $outputRoot "$name.png"
  $tempPath = "$outPath.tmp.png"
  $framed.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Move-Item -Force -LiteralPath $tempPath -Destination $outPath

  $cropped.Dispose()
  $trimmed.Dispose()
  $framed.Dispose()
}

$source = [System.Drawing.Image]::FromFile($sourcePath)

$assets = @(
  @{ name = "long"; crop = Rect 48 64 145 250 }
)

foreach ($asset in $assets) {
  Export-Hair $source $asset.name $asset.crop
}

$source.Dispose()
Write-Host "Extracted new hair assets from $sourcePath"
