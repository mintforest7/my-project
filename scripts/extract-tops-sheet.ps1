param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputDir
)

Add-Type -AssemblyName System.Drawing

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.Rectangle $x, $y, $w, $h
}

function Export-Top($source, $index, $crop, $outputDir) {
  $raw = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($raw)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.DrawImage($source, (Rect 0 0 $crop.Width $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  $minX = $raw.Width
  $minY = $raw.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $raw.Height; $y++) {
    for ($x = 0; $x -lt $raw.Width; $x++) {
      $pixel = $raw.GetPixel($x, $y)
      $nearBg = $pixel.R -gt 220 -and $pixel.G -gt 214 -and $pixel.B -gt 207 -and ([Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B)) - [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))) -lt 34
      if ($nearBg) {
        $raw.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
        continue
      }
      if ($pixel.A -gt 10) {
        $minX = [Math]::Min($minX, $x)
        $minY = [Math]::Min($minY, $y)
        $maxX = [Math]::Max($maxX, $x)
        $maxY = [Math]::Max($maxY, $y)
      }
    }
  }

  Remove-EdgeArtifacts $raw

  $minX = $raw.Width
  $minY = $raw.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $raw.Height; $y++) {
    for ($x = 0; $x -lt $raw.Width; $x++) {
      if ($raw.GetPixel($x, $y).A -le 10) { continue }
      $minX = [Math]::Min($minX, $x)
      $minY = [Math]::Min($minY, $y)
      $maxX = [Math]::Max($maxX, $x)
      $maxY = [Math]::Max($maxY, $y)
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    $raw.Dispose()
    return
  }

  $padding = 4
  $trimX = [Math]::Max(0, $minX - $padding)
  $trimY = [Math]::Max(0, $minY - $padding)
  $trimW = [Math]::Min($raw.Width - $trimX, ($maxX - $minX + 1) + $padding * 2)
  $trimH = [Math]::Min($raw.Height - $trimY, ($maxY - $minY + 1) + $padding * 2)

  $trimmed = New-Object System.Drawing.Bitmap $trimW, $trimH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $trimGraphics = [System.Drawing.Graphics]::FromImage($trimmed)
  $trimGraphics.DrawImage($raw, (Rect 0 0 $trimW $trimH), (Rect $trimX $trimY $trimW $trimH), [System.Drawing.GraphicsUnit]::Pixel)
  $trimGraphics.Dispose()

  $name = "top-{0:D2}.png" -f $index
  $outPath = Join-Path $outputDir $name
  $trimmed.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $trimmed.Dispose()
  $raw.Dispose()
}

function Remove-EdgeArtifacts($bitmap) {
  $visited = New-Object 'bool[,]' $bitmap.Width, $bitmap.Height
  $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
  $component = New-Object System.Collections.Generic.List[System.Drawing.Point]

  for ($startY = 0; $startY -lt $bitmap.Height; $startY++) {
    for ($startX = 0; $startX -lt $bitmap.Width; $startX++) {
      if ($visited[$startX, $startY] -or $bitmap.GetPixel($startX, $startY).A -le 10) { continue }

      $touchesEdge = $false
      $component.Clear()
      $queue.Clear()
      $queue.Enqueue((New-Object System.Drawing.Point $startX, $startY))
      $visited[$startX, $startY] = $true

      while ($queue.Count -gt 0) {
        $point = $queue.Dequeue()
        $component.Add($point)
        if ($point.X -eq 0 -or $point.Y -eq 0 -or $point.X -eq ($bitmap.Width - 1) -or $point.Y -eq ($bitmap.Height - 1)) {
          $touchesEdge = $true
        }

        foreach ($delta in @((-1,0),(1,0),(0,-1),(0,1))) {
          $nx = $point.X + $delta[0]
          $ny = $point.Y + $delta[1]
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $bitmap.Width -or $ny -ge $bitmap.Height) { continue }
          if ($visited[$nx, $ny] -or $bitmap.GetPixel($nx, $ny).A -le 10) { continue }
          $visited[$nx, $ny] = $true
          $queue.Enqueue((New-Object System.Drawing.Point $nx, $ny))
        }
      }

      if ($touchesEdge -and $component.Count -lt 2600) {
        foreach ($point in $component) {
          $pixel = $bitmap.GetPixel($point.X, $point.Y)
          $bitmap.SetPixel($point.X, $point.Y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
        }
      }
    }
  }
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$crops = @(
  # Row 1
  (Rect 20 55 90 95), (Rect 125 55 95 95), (Rect 240 55 95 95),
  (Rect 360 58 90 95), (Rect 470 58 90 95), (Rect 580 58 90 95),
  (Rect 700 58 82 95), (Rect 805 58 88 95), (Rect 910 58 88 95),
  (Rect 1010 58 88 95), (Rect 1100 58 92 95), (Rect 1195 58 90 95),
  (Rect 1295 58 95 95), (Rect 1390 58 95 95), (Rect 1480 58 55 95),
  # Row 2
  (Rect 18 178 92 95), (Rect 125 178 95 95), (Rect 235 178 95 95),
  (Rect 360 178 90 95), (Rect 470 178 92 95), (Rect 580 178 92 95),
  (Rect 698 178 88 95), (Rect 805 178 88 95), (Rect 910 178 88 95),
  (Rect 1002 178 95 95), (Rect 1095 178 98 95), (Rect 1196 178 92 95),
  (Rect 1295 178 90 95), (Rect 1390 178 90 95), (Rect 1480 178 55 95),
  # Row 3
  (Rect 20 350 100 95), (Rect 135 350 100 95), (Rect 250 350 100 95),
  (Rect 370 350 100 95), (Rect 485 350 100 95), (Rect 600 350 100 95),
  (Rect 710 350 100 95), (Rect 825 350 100 95), (Rect 940 350 100 95),
  (Rect 1048 350 98 95), (Rect 1160 350 100 95), (Rect 1270 350 98 95),
  (Rect 1378 350 98 95), (Rect 1480 350 56 95),
  # Row 4
  (Rect 20 458 100 95), (Rect 135 458 100 95), (Rect 250 458 100 95),
  (Rect 370 458 100 95), (Rect 485 458 100 95), (Rect 600 458 100 95),
  (Rect 710 458 100 95), (Rect 825 458 100 95), (Rect 940 458 100 95),
  (Rect 1048 458 98 95), (Rect 1160 458 100 95), (Rect 1270 458 98 95),
  (Rect 1378 458 98 95), (Rect 1480 458 56 95),
  # Row 5
  (Rect 18 590 105 95), (Rect 135 590 105 95), (Rect 250 590 105 95),
  (Rect 370 590 100 95), (Rect 485 590 100 95), (Rect 600 590 100 95),
  (Rect 710 590 100 95), (Rect 825 590 100 95), (Rect 940 590 100 95),
  (Rect 1048 590 98 95), (Rect 1160 590 100 95), (Rect 1270 590 98 95),
  (Rect 1378 590 98 95), (Rect 1480 590 56 95),
  # Row 6
  (Rect 18 700 105 95), (Rect 135 700 105 95), (Rect 250 700 105 95),
  (Rect 370 700 100 95), (Rect 485 700 100 95), (Rect 600 700 100 95),
  (Rect 710 700 100 95), (Rect 825 700 100 95), (Rect 940 700 100 95),
  (Rect 1048 700 98 95), (Rect 1160 700 100 95), (Rect 1270 700 98 95),
  (Rect 1378 700 98 95), (Rect 1480 700 56 95),
  # Bottom rows
  (Rect 20 850 100 95), (Rect 135 850 100 95), (Rect 250 850 100 95),
  (Rect 370 850 100 95), (Rect 485 850 100 95), (Rect 600 850 100 95),
  (Rect 705 850 100 95), (Rect 815 850 100 95), (Rect 925 850 100 95),
  (Rect 1035 850 100 95), (Rect 1145 850 100 95), (Rect 1255 850 100 95),
  (Rect 1365 850 100 95), (Rect 1470 850 65 95),
  (Rect 20 955 100 65), (Rect 135 955 100 65), (Rect 250 955 100 65),
  (Rect 370 955 100 65), (Rect 485 955 100 65), (Rect 600 955 100 65)
)

$index = 1
foreach ($crop in $crops) {
  Export-Top $source $index $crop $OutputDir
  $index++
}

$source.Dispose()
Write-Host "Extracted $($index - 1) tops."
