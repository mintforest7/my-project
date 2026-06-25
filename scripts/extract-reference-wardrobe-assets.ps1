Add-Type -AssemblyName System.Drawing

$root = Join-Path (Get-Location) "public/assets/style-rush"
$sourcePath = Join-Path $root "wardrobe-reference-v3.png"
$canvasW = 420
$canvasH = 620

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.Rectangle $x, $y, $w, $h
}

function New-Layer {
  $bitmap = New-Object System.Drawing.Bitmap $canvasW, $canvasH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @($bitmap, $graphics)
}

function Remove-SmallAlphaIslands($bitmap, $minPixels) {
  $visited = New-Object 'bool[,]' $bitmap.Width, $bitmap.Height
  $directions = @(
    (New-Object Drawing.Point 1, 0),
    (New-Object Drawing.Point -1, 0),
    (New-Object Drawing.Point 0, 1),
    (New-Object Drawing.Point 0, -1)
  )

  for ($startY = 0; $startY -lt $bitmap.Height; $startY++) {
    for ($startX = 0; $startX -lt $bitmap.Width; $startX++) {
      if ($visited[$startX, $startY]) { continue }
      $visited[$startX, $startY] = $true
      if ($bitmap.GetPixel($startX, $startY).A -eq 0) { continue }

      $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
      $pixels = New-Object System.Collections.Generic.List[System.Drawing.Point]
      $queue.Enqueue((New-Object Drawing.Point $startX, $startY))
      $pixels.Add((New-Object Drawing.Point $startX, $startY))

      while ($queue.Count -gt 0) {
        $point = $queue.Dequeue()
        foreach ($direction in $directions) {
          $nextX = $point.X + $direction.X
          $nextY = $point.Y + $direction.Y
          if ($nextX -lt 0 -or $nextY -lt 0 -or $nextX -ge $bitmap.Width -or $nextY -ge $bitmap.Height) { continue }
          if ($visited[$nextX, $nextY]) { continue }
          $visited[$nextX, $nextY] = $true
          if ($bitmap.GetPixel($nextX, $nextY).A -eq 0) { continue }
          $queue.Enqueue((New-Object Drawing.Point $nextX, $nextY))
          $pixels.Add((New-Object Drawing.Point $nextX, $nextY))
        }
      }

      if ($pixels.Count -lt $minPixels) {
        foreach ($pixelPoint in $pixels) {
          $pixel = $bitmap.GetPixel($pixelPoint.X, $pixelPoint.Y)
          $bitmap.SetPixel($pixelPoint.X, $pixelPoint.Y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
        }
      }
    }
  }
}

function Remove-EdgeBackground($bitmap) {
  $visited = New-Object 'bool[,]' $bitmap.Width, $bitmap.Height
  $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
  $directions = @(
    (New-Object Drawing.Point 1, 0),
    (New-Object Drawing.Point -1, 0),
    (New-Object Drawing.Point 0, 1),
    (New-Object Drawing.Point 0, -1)
  )
  $maxX = $bitmap.Width - 1
  $maxY = $bitmap.Height - 1

  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    $queue.Enqueue((New-Object Drawing.Point $x, 0))
    $queue.Enqueue((New-Object Drawing.Point $x, $maxY))
  }
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    $queue.Enqueue((New-Object Drawing.Point 0, $y))
    $queue.Enqueue((New-Object Drawing.Point $maxX, $y))
  }

  while ($queue.Count -gt 0) {
    $point = $queue.Dequeue()
    $x = $point.X
    $y = $point.Y
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $bitmap.Width -or $y -ge $bitmap.Height) { continue }
    if ($visited[$x, $y]) { continue }
    $visited[$x, $y] = $true

    $pixel = $bitmap.GetPixel($x, $y)
    if (-not (Is-BackgroundPixel $pixel)) { continue }

    $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
    foreach ($direction in $directions) {
      $queue.Enqueue((New-Object Drawing.Point ($x + $direction.X), ($y + $direction.Y)))
    }
  }
}

function Is-BackgroundPixel($pixel) {
  if ($pixel.A -eq 0) { return $true }
  $nearWhite = $pixel.R -gt 238 -and $pixel.G -gt 236 -and $pixel.B -gt 232
  $nearPanel = $pixel.R -gt 226 -and $pixel.G -gt 218 -and $pixel.B -gt 218 -and ([Math]::Abs($pixel.R - $pixel.G) -lt 22)
  return $nearWhite -or $nearPanel
}

function Export-Asset($source, $outRelativePath, $crop, $dest) {
  $cropBitmap = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cropGraphics = [System.Drawing.Graphics]::FromImage($cropBitmap)
  $cropGraphics.DrawImage($source, (Rect 0 0 $crop.Width $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $cropGraphics.Dispose()
  Remove-EdgeBackground $cropBitmap
  Remove-SmallAlphaIslands $cropBitmap 24

  $bitmap = New-Object System.Drawing.Bitmap $dest.Width, $dest.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage($cropBitmap, (Rect 0 0 $dest.Width $dest.Height))

  $outPath = Join-Path $root $outRelativePath
  $tempPath = "$outPath.tmp.png"
  $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  $cropBitmap.Dispose()
  Move-Item -Force -LiteralPath $tempPath -Destination $outPath
}

$source = [System.Drawing.Image]::FromFile($sourcePath)

function Save-NeutralDoll {
  $path = Join-Path $root "body/reference-doll.png"
  $outPath = Join-Path $root "body/reference-doll-neutral.png"
  $bitmap = New-Object System.Drawing.Bitmap $path

  for ($y = 120; $y -lt 360; $y++) {
    for ($x = 100; $x -lt 320; $x++) {
      $pixel = $bitmap.GetPixel($x, $y)
      $isBodysuit = $pixel.A -gt 0 -and $pixel.R -gt 210 -and $pixel.G -gt 95 -and $pixel.G -lt 190 -and $pixel.B -gt 130 -and $pixel.B -lt 235
      if (-not $isBodysuit) { continue }

      $luminance = ($pixel.R * 0.299 + $pixel.G * 0.587 + $pixel.B * 0.114) / 255
      $shade = 0.82 + ($luminance * 0.32)
      $r = [Math]::Min(255, [Math]::Round(246 * $shade))
      $g = [Math]::Min(255, [Math]::Round(188 * $shade))
      $b = [Math]::Min(255, [Math]::Round(151 * $shade))
      $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $r, $g, $b))
    }
  }

  $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Export-Doll($source) {
  $crop = Rect 666 136 145 388
  $dest = Rect 116 34 188 540
  $cropBitmap = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cropGraphics = [System.Drawing.Graphics]::FromImage($cropBitmap)
  $cropGraphics.DrawImage($source, (Rect 0 0 $crop.Width $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $cropGraphics.Dispose()
  Remove-EdgeBackground $cropBitmap
  Remove-SmallAlphaIslands $cropBitmap 24

  $layer = New-Layer
  $bitmap = $layer[0]
  $graphics = $layer[1]
  $graphics.DrawImage($cropBitmap, $dest)

  $outPath = Join-Path $root "body/reference-doll.png"
  $tempPath = "$outPath.tmp.png"
  $bitmap.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  $cropBitmap.Dispose()
  Move-Item -Force -LiteralPath $tempPath -Destination $outPath
  Save-NeutralDoll
}

Export-Doll $source

$assets = @(
  @{ path = "hair/long.png"; crop = Rect 30 80 34 66; dest = Rect 128 -4 164 220 },

  @{ path = "bangs/straight.png"; crop = Rect 22 172 42 48; dest = Rect 164 48 92 56 },
  @{ path = "bangs/side-swept.png"; crop = Rect 224 172 42 48; dest = Rect 162 48 96 60 },
  @{ path = "bangs/curtain.png"; crop = Rect 276 172 42 48; dest = Rect 162 48 96 62 },
  @{ path = "bangs/rounded.png"; crop = Rect 122 172 44 48; dest = Rect 162 48 96 58 },
  @{ path = "bangs/heavy-straight.png"; crop = Rect 72 172 42 48; dest = Rect 162 48 96 60 },
  @{ path = "bangs/wispy.png"; crop = Rect 378 172 42 48; dest = Rect 164 48 92 60 },
  @{ path = "bangs/layered.png"; crop = Rect 482 172 42 48; dest = Rect 162 48 96 62 },
  @{ path = "bangs/korean.png"; crop = Rect 914 172 42 48; dest = Rect 164 48 92 60 },

  @{ path = "bottoms/skirt.png"; crop = Rect 370 342 50 58; dest = Rect 132 286 156 120 },
  @{ path = "bottoms/pants.png"; crop = Rect 842 342 48 70; dest = Rect 140 292 140 248 },
  @{ path = "bottoms/shorts.png"; crop = Rect 32 342 52 58; dest = Rect 136 286 148 108 },
  @{ path = "bottoms/cargo.png"; crop = Rect 928 342 50 70; dest = Rect 138 292 144 248 },
  @{ path = "bottoms/wide-leg.png"; crop = Rect 796 342 48 70; dest = Rect 140 292 140 248 },
  @{ path = "bottoms/low-rise.png"; crop = Rect 82 342 52 58; dest = Rect 136 286 148 108 },
  @{ path = "bottoms/pleated.png"; crop = Rect 966 342 48 58; dest = Rect 132 288 156 120 },
  @{ path = "bottoms/plaid.png"; crop = Rect 696 738 48 58; dest = Rect 132 288 156 122 },

  @{ path = "dresses/gown.png"; crop = Rect 1280 738 46 110; dest = Rect 128 166 164 384 },
  @{ path = "dresses/mini.png"; crop = Rect 1012 426 48 96; dest = Rect 132 166 156 236 },
  @{ path = "dresses/cape.png"; crop = Rect 1368 738 46 110; dest = Rect 128 166 164 384 },
  @{ path = "dresses/slip.png"; crop = Rect 1168 426 48 96; dest = Rect 134 166 152 236 },
  @{ path = "dresses/tutu.png"; crop = Rect 1058 426 48 96; dest = Rect 130 166 160 244 },
  @{ path = "dresses/pinafore.png"; crop = Rect 1010 738 48 88; dest = Rect 132 166 156 228 },
  @{ path = "dresses/lace.png"; crop = Rect 1096 426 48 96; dest = Rect 132 166 156 236 },

  @{ path = "shoes/boots.png"; crop = Rect 1368 548 46 52; dest = Rect 146 522 128 62 },
  @{ path = "shoes/sneakers.png"; crop = Rect 34 548 46 50; dest = Rect 150 530 120 50 },
  @{ path = "shoes/sneakers-star.png"; crop = Rect 82 548 46 50; dest = Rect 150 530 120 50 },
  @{ path = "shoes/sneakers-heart.png"; crop = Rect 1256 548 46 50; dest = Rect 150 530 120 50 },
  @{ path = "shoes/heels.png"; crop = Rect 370 548 46 50; dest = Rect 150 530 120 52 },
  @{ path = "shoes/platform.png"; crop = Rect 185 548 46 52; dest = Rect 148 528 124 56 },
  @{ path = "shoes/loafers.png"; crop = Rect 1200 548 46 50; dest = Rect 150 530 120 50 },
  @{ path = "shoes/ballet-flats.png"; crop = Rect 1424 548 46 50; dest = Rect 152 532 116 48 },
  @{ path = "shoes/chunky.png"; crop = Rect 128 548 46 52; dest = Rect 148 528 124 56 },

  @{ path = "accessories/bag.png"; crop = Rect 370 622 48 66; dest = Rect 252 278 78 96 },
  @{ path = "accessories/bow.png"; crop = Rect 808 922 28 28; dest = Rect 174 38 72 52 },
  @{ path = "accessories/choker.png"; crop = Rect 572 894 32 42; dest = Rect 180 168 60 56 },
  @{ path = "accessories/cape.png"; crop = Rect 1278 738 50 110; dest = Rect 72 184 278 384 },
  @{ path = "accessories/crown.png"; crop = Rect 1014 894 42 42; dest = Rect 170 30 80 56 },
  @{ path = "accessories/flower.png"; crop = Rect 996 950 42 42; dest = Rect 226 56 48 42 },
  @{ path = "accessories/glasses.png"; crop = Rect 306 860 48 28; dest = Rect 168 100 84 40 },
  @{ path = "accessories/hat.png"; crop = Rect 1028 922 42 42; dest = Rect 162 28 96 58 },
  @{ path = "accessories/headband.png"; crop = Rect 1034 950 42 42; dest = Rect 158 44 104 66 },
  @{ path = "accessories/headset.png"; crop = Rect 1054 920 42 42; dest = Rect 154 42 112 90 },
  @{ path = "accessories/necklace.png"; crop = Rect 546 888 32 54; dest = Rect 178 166 64 84 },
  @{ path = "accessories/pearls.png"; crop = Rect 928 950 42 42; dest = Rect 174 168 72 48 },
  @{ path = "accessories/tiara.png"; crop = Rect 1056 894 42 42; dest = Rect 166 34 88 52 },
  @{ path = "accessories/wings.png"; crop = Rect 1070 950 42 42; dest = Rect 64 220 292 210 }
)

foreach ($asset in $assets) {
  Export-Asset $source $asset.path $asset.crop $asset.dest
}

$source.Dispose()
Write-Host "Extracted wardrobe assets from $sourcePath"
