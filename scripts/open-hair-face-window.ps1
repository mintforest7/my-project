param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$bitmap = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
$canvas = New-Object System.Drawing.Bitmap $bitmap.Width, $bitmap.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.DrawImage($bitmap, 0, 0, $bitmap.Width, $bitmap.Height)
$graphics.Dispose()
$bitmap.Dispose()

$centerX = 210.0
$centerY = 122.0
$radiusX = 58.0
$radiusY = 76.0

for ($y = 45; $y -lt 205; $y++) {
  for ($x = 135; $x -lt 285; $x++) {
    $dx = ($x - $centerX) / $radiusX
    $dy = ($y - $centerY) / $radiusY
    $distance = ($dx * $dx) + ($dy * $dy)
    if ($distance -gt 1.0) { continue }

    $pixel = $canvas.GetPixel($x, $y)
    if ($pixel.A -eq 0) { continue }

    $fade = [Math]::Min(1.0, [Math]::Max(0.0, (1.0 - $distance) * 2.2))
    $newAlpha = [Math]::Round($pixel.A * (1.0 - $fade))
    $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newAlpha, $pixel.R, $pixel.G, $pixel.B))
  }
}

$tempPath = "$OutputPath.tmp.png"
$canvas.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose()

if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}
Move-Item -Force -LiteralPath $tempPath -Destination $OutputPath
