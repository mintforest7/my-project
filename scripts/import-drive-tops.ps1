param(
  [Parameter(Mandatory = $true)]
  [string]$FolderHtmlPath,
  [Parameter(Mandatory = $true)]
  [string]$DownloadDir,
  [Parameter(Mandatory = $true)]
  [string]$OutputDir
)

Add-Type -AssemblyName System.Drawing

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.Rectangle $x, $y, $w, $h
}

function Convert-ToTransparentPng($inputPath, $outputPath) {
  $source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $inputPath))
  $output = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
  $graphics.Dispose()

  for ($y = 0; $y -lt $output.Height; $y++) {
    for ($x = 0; $x -lt $output.Width; $x++) {
      $pixel = $output.GetPixel($x, $y)
      $max = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
      $min = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
      $isBackground = $pixel.R -gt 226 -and $pixel.G -gt 221 -and $pixel.B -gt 214 -and ($max - $min) -lt 28
      if ($isBackground) {
        $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      }
    }
  }

  $output.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
  $source.Dispose()
}

New-Item -ItemType Directory -Force -Path $DownloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$html = Get-Content -LiteralPath $FolderHtmlPath -Raw
$matches = [regex]::Matches($html, 'data-id="([A-Za-z0-9_-]{20,})"[\s\S]{0,900}?data-tooltip="([^"]+)"')
$ids = New-Object System.Collections.Generic.List[string]
foreach ($match in $matches) {
  $id = $match.Groups[1].Value
  $name = $match.Groups[2].Value
  if ($name -notmatch '\.jpe?g Image$') { continue }
  if ($ids.Contains($id)) { continue }
  $ids.Add($id)
}

if ($ids.Count -eq 0) {
  throw "No downloadable JPG images found in Drive folder HTML."
}

Get-ChildItem -LiteralPath $OutputDir -File | Remove-Item -Force

$index = 1
foreach ($id in $ids) {
  $downloadPath = Join-Path $DownloadDir ("drive-top-{0:D2}.jpg" -f $index)
  $outputPath = Join-Path $OutputDir ("top-{0:D2}.png" -f $index)
  $url = "https://drive.google.com/uc?export=download&id=$id"
  Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing
  Convert-ToTransparentPng $downloadPath $outputPath
  $index++
}

Write-Host "Imported $($index - 1) tops from Drive."
