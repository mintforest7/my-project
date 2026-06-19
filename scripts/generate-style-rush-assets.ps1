Add-Type -AssemblyName System.Drawing

$root = Join-Path (Get-Location) "public/assets/style-rush"
@("body", "hair", "bangs", "makeup", "tops", "bottoms", "dresses", "shoes", "accessories") | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $_) | Out-Null
}
$canvasW = 420
$canvasH = 620
$scale = 3
$w = $canvasW * $scale
$h = $canvasH * $scale

function New-Layer {
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.ScaleTransform($scale, $scale)
  return @($bmp, $g)
}

function Save-Layer($bmp, $g, $path) {
  $g.Flush()
  $small = New-Object System.Drawing.Bitmap $canvasW, $canvasH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $sg = [System.Drawing.Graphics]::FromImage($small)
  $sg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $sg.DrawImage($bmp, 0, 0, $canvasW, $canvasH)
  $small.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $sg.Dispose()
  $small.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

function Brush($color) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))
}

function Pen($color, $width = 2) {
  return New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($color)), $width
}

function Path-Body($points) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddClosedCurve($points, 0.45)
  return $p
}

function Rounded-Rect($x, $y, $width, $height, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $width - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $width - $d, $y + $height - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $height - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-Rounded($g, $brush, $x, $y, $width, $height, $radius) {
  $path = Rounded-Rect $x $y $width $height $radius
  $g.FillPath($brush, $path)
}

function Stroke-Rounded($g, $pen, $x, $y, $width, $height, $radius) {
  $path = Rounded-Rect $x $y $width $height $radius
  $g.DrawPath($pen, $path)
}

function Draw-BodyPart($name) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $skin = Brush "#c8c8c8"; $line = Pen "#555555" 2

  if ($name -eq "head") {
    $head = Path-Body @(
      (New-Object Drawing.PointF 170, 58), (New-Object Drawing.PointF 190, 38),
      (New-Object Drawing.PointF 210, 34), (New-Object Drawing.PointF 230, 38),
      (New-Object Drawing.PointF 250, 58), (New-Object Drawing.PointF 258, 104),
      (New-Object Drawing.PointF 246, 146), (New-Object Drawing.PointF 224, 166),
      (New-Object Drawing.PointF 210, 170), (New-Object Drawing.PointF 196, 166),
      (New-Object Drawing.PointF 174, 146), (New-Object Drawing.PointF 162, 104)
    )
    $g.FillEllipse($skin, 156, 92, 12, 30)
    $g.FillEllipse($skin, 252, 92, 12, 30)
    $g.FillPath($skin, $head)
    $g.DrawArc($line, 156, 92, 12, 30, 95, 170)
    $g.DrawArc($line, 252, 92, 12, 30, 275, 170)
    $g.DrawPath($line, $head)
  } elseif ($name -eq "torso") {
    $torso = Path-Body @(
      (New-Object Drawing.PointF 196, 158), (New-Object Drawing.PointF 224, 158),
      (New-Object Drawing.PointF 226, 184), (New-Object Drawing.PointF 258, 198),
      (New-Object Drawing.PointF 272, 226), (New-Object Drawing.PointF 258, 286),
      (New-Object Drawing.PointF 236, 328), (New-Object Drawing.PointF 260, 376),
      (New-Object Drawing.PointF 242, 402), (New-Object Drawing.PointF 210, 414),
      (New-Object Drawing.PointF 178, 402), (New-Object Drawing.PointF 160, 376),
      (New-Object Drawing.PointF 184, 348), (New-Object Drawing.PointF 162, 292),
      (New-Object Drawing.PointF 148, 226), (New-Object Drawing.PointF 162, 198),
      (New-Object Drawing.PointF 192, 184)
    )
    $g.FillPath($skin, $torso)
    $g.DrawPath($line, $torso)
  } elseif ($name -eq "left-arm") {
    $leftArm = Path-Body @(
      (New-Object Drawing.PointF 158, 204), (New-Object Drawing.PointF 146, 238),
      (New-Object Drawing.PointF 146, 300), (New-Object Drawing.PointF 136, 344),
      (New-Object Drawing.PointF 136, 392), (New-Object Drawing.PointF 148, 414),
      (New-Object Drawing.PointF 158, 392), (New-Object Drawing.PointF 162, 344),
      (New-Object Drawing.PointF 168, 306), (New-Object Drawing.PointF 178, 220)
    )
    $g.FillPath($skin, $leftArm)
    $g.DrawPath($line, $leftArm)
    $g.DrawLine((Pen "#555555" 1), 144, 392, 138, 412)
    $g.DrawLine((Pen "#555555" 1), 150, 394, 150, 418)
  } elseif ($name -eq "right-arm") {
    $rightArm = Path-Body @(
      (New-Object Drawing.PointF 262, 204), (New-Object Drawing.PointF 274, 238),
      (New-Object Drawing.PointF 274, 300), (New-Object Drawing.PointF 284, 344),
      (New-Object Drawing.PointF 284, 392), (New-Object Drawing.PointF 272, 414),
      (New-Object Drawing.PointF 262, 392), (New-Object Drawing.PointF 258, 344),
      (New-Object Drawing.PointF 252, 306), (New-Object Drawing.PointF 242, 220)
    )
    $g.FillPath($skin, $rightArm)
    $g.DrawPath($line, $rightArm)
    $g.DrawLine((Pen "#555555" 1), 276, 392, 282, 412)
    $g.DrawLine((Pen "#555555" 1), 270, 394, 270, 418)
  } elseif ($name -eq "left-leg") {
    $leftLeg = Path-Body @(
      (New-Object Drawing.PointF 160, 368), (New-Object Drawing.PointF 202, 368),
      (New-Object Drawing.PointF 200, 458), (New-Object Drawing.PointF 194, 548),
      (New-Object Drawing.PointF 196, 606), (New-Object Drawing.PointF 174, 610),
      (New-Object Drawing.PointF 164, 548), (New-Object Drawing.PointF 150, 458)
    )
    $leftFoot = Path-Body @(
      (New-Object Drawing.PointF 166, 592), (New-Object Drawing.PointF 194, 592),
      (New-Object Drawing.PointF 204, 604), (New-Object Drawing.PointF 198, 616),
      (New-Object Drawing.PointF 172, 616), (New-Object Drawing.PointF 162, 606)
    )
    $g.FillPath($skin, $leftLeg)
    $g.DrawPath($line, $leftLeg)
    $g.FillPath($skin, $leftFoot)
    $g.DrawPath($line, $leftFoot)
    for ($x = 174; $x -le 194; $x += 5) { $g.DrawLine((Pen "#555555" 1), $x, 606, $x - 2, 616) }
  } elseif ($name -eq "right-leg") {
    $rightLeg = Path-Body @(
      (New-Object Drawing.PointF 218, 368), (New-Object Drawing.PointF 260, 368),
      (New-Object Drawing.PointF 270, 458), (New-Object Drawing.PointF 256, 548),
      (New-Object Drawing.PointF 246, 610), (New-Object Drawing.PointF 224, 606),
      (New-Object Drawing.PointF 226, 548), (New-Object Drawing.PointF 220, 458)
    )
    $rightFoot = Path-Body @(
      (New-Object Drawing.PointF 226, 592), (New-Object Drawing.PointF 254, 592),
      (New-Object Drawing.PointF 258, 606), (New-Object Drawing.PointF 248, 616),
      (New-Object Drawing.PointF 222, 616), (New-Object Drawing.PointF 216, 604)
    )
    $g.FillPath($skin, $rightLeg)
    $g.DrawPath($line, $rightLeg)
    $g.FillPath($skin, $rightFoot)
    $g.DrawPath($line, $rightFoot)
    for ($x = 228; $x -le 248; $x += 5) { $g.DrawLine((Pen "#555555" 1), $x, 606, $x - 2, 616) }
  }
  Save-Layer $bmp $g (Join-Path $root "body/$name.png")
}

function Draw-Face() {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $ink = Pen "#2c2638" 2
  $lip = Brush "#b95f75"
  $shine = Brush "#ffffff"

  $g.FillEllipse((Brush "#ffffff"), 176, 102, 23, 15)
  $g.FillEllipse((Brush "#ffffff"), 222, 102, 23, 15)
  $g.FillEllipse((Brush "#3a3045"), 184, 105, 9, 10)
  $g.FillEllipse((Brush "#3a3045"), 230, 105, 9, 10)
  $g.FillEllipse($shine, 187, 106, 3, 3)
  $g.FillEllipse($shine, 233, 106, 3, 3)
  $g.DrawArc($ink, 174, 96, 28, 14, 200, 120)
  $g.DrawArc($ink, 220, 96, 28, 14, 220, 120)
  $g.DrawLine((Pen "#2c2638" 2), 178, 102, 170, 98)
  $g.DrawLine((Pen "#2c2638" 2), 182, 100, 176, 94)
  $g.DrawLine((Pen "#2c2638" 2), 242, 102, 250, 98)
  $g.DrawLine((Pen "#2c2638" 2), 238, 100, 244, 94)
  $g.DrawArc((Pen "#5f4a5a" 2), 176, 88, 24, 10, 200, 120)
  $g.DrawArc((Pen "#5f4a5a" 2), 222, 88, 24, 10, 220, 120)
  $g.DrawLine((Pen "#8d6b68" 2), 211, 112, 207, 127)
  $g.FillEllipse((Brush "#f2a2a8"), 174, 124, 24, 12)
  $g.FillEllipse((Brush "#f2a2a8"), 222, 124, 24, 12)
  $g.FillPie($lip, 194, 142, 32, 12, 0, 180)
  $g.FillPie((Brush "#9f4a63"), 196, 146, 28, 10, 180, 180)
  $g.DrawArc((Pen "#7f3d50" 1), 194, 142, 32, 12, 0, 180)
  $g.DrawLine((Pen "#7f3d50" 1), 198, 148, 222, 148)
  $g.FillEllipse($shine, 204, 144, 8, 2)
  Save-Layer $bmp $g (Join-Path $root "body/face.png")
}

function Draw-BaseBodysuit() {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#f7b8cc"; $shade = Brush "#df8faf"; $hi = Brush "#fff0f6"; $line = Pen "#bd6e8d" 2

  $suit = Path-Body @(
    (New-Object Drawing.PointF 182,188), (New-Object Drawing.PointF 238,188),
    (New-Object Drawing.PointF 258,214), (New-Object Drawing.PointF 256,286),
    (New-Object Drawing.PointF 240,326), (New-Object Drawing.PointF 258,368),
    (New-Object Drawing.PointF 248,408), (New-Object Drawing.PointF 226,424),
    (New-Object Drawing.PointF 210,430), (New-Object Drawing.PointF 198,424),
    (New-Object Drawing.PointF 172,408), (New-Object Drawing.PointF 162,368),
    (New-Object Drawing.PointF 180,326),
    (New-Object Drawing.PointF 164,286),
    (New-Object Drawing.PointF 162,214)
  )
  $g.FillPath($main, $suit)
  $g.DrawPath($line, $suit)

  $g.DrawArc((Pen "#fff6fa" 3), 176, 188, 68, 36, 15, 150)
  $g.DrawLine((Pen "#fff6fa" 2), 174, 220, 180, 312)
  $g.DrawLine((Pen "#fff6fa" 2), 246, 220, 240, 312)
  $g.DrawLine((Pen "#cf7f9e" 2), 174, 406, 210, 426)
  $g.DrawLine((Pen "#cf7f9e" 2), 246, 406, 210, 426)
  Fill-Rounded $g $shade 180 318 60 14 5
  $g.FillEllipse($hi, 198, 205, 24, 10)

  Save-Layer $bmp $g (Join-Path $root "body/bodysuit.png")
}

function Draw-Top($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#bbbbbb"; $shade = Brush "#777777"; $hi = Brush "#eeeeee"; $line = Pen "#646464" 2
  if ($mode -eq "shirt") {
    $p = Path-Body @(
      (New-Object Drawing.PointF 176,190),(New-Object Drawing.PointF 244,190),
      (New-Object Drawing.PointF 254,228),(New-Object Drawing.PointF 248,304),
      (New-Object Drawing.PointF 172,304),(New-Object Drawing.PointF 166,228)
    )
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.FillPolygon($hi, @((New-Object Drawing.Point 190,198),(New-Object Drawing.Point 210,226),(New-Object Drawing.Point 230,198)))
    $g.DrawLine((Pen "#777777" 2), 164, 208, 184, 236)
    $g.DrawLine((Pen "#777777" 2), 256, 208, 236, 236)
    $g.DrawArc((Pen "#f7f7f7" 2), 176, 204, 68, 36, 20, 140)
    $g.DrawLine((Pen "#ffffff" 3), 210, 232, 210, 292)
    $g.DrawLine((Pen "#8a8a8a" 1), 176, 286, 244, 286)
    $g.FillEllipse((Brush "#ffffff"), 197, 248, 6, 6)
    $g.FillEllipse((Brush "#ffffff"), 197, 266, 6, 6)
    $g.FillEllipse((Brush "#ffffff"), 217, 248, 6, 6)
    $g.FillEllipse((Brush "#ffffff"), 217, 266, 6, 6)
  } elseif ($mode -eq "jacket") {
    $p = Path-Body @(
      (New-Object Drawing.PointF 170,188),(New-Object Drawing.PointF 250,188),
      (New-Object Drawing.PointF 262,228),(New-Object Drawing.PointF 254,320),
      (New-Object Drawing.PointF 166,320),(New-Object Drawing.PointF 158,228)
    )
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.FillPolygon($hi, @((New-Object Drawing.Point 166,198),(New-Object Drawing.Point 205,240),(New-Object Drawing.Point 205,310),(New-Object Drawing.Point 158,310)))
    $g.FillPolygon($shade, @((New-Object Drawing.Point 254,198),(New-Object Drawing.Point 215,240),(New-Object Drawing.Point 215,310),(New-Object Drawing.Point 262,310)))
    $g.DrawLine((Pen "#ffffff" 4), 210, 206, 210, 316)
    $g.DrawLine((Pen "#8a8a8a" 2), 170, 226, 170, 302)
    $g.DrawLine((Pen "#8a8a8a" 2), 250, 226, 250, 302)
    Stroke-Rounded $g (Pen "#ffffff" 2) 176 258 24 20 5
    Stroke-Rounded $g (Pen "#ffffff" 2) 220 258 24 20 5
    $g.DrawEllipse((Pen "#ffffff" 3), 200, 216, 20, 14)
  } elseif ($mode -eq "hoodie") {
    $p = Path-Body @((New-Object Drawing.PointF 168,188),(New-Object Drawing.PointF 252,188),(New-Object Drawing.PointF 260,314),(New-Object Drawing.PointF 160,314))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawArc((Pen "#ffffff" 4), 180, 190, 60, 46, 10, 160)
    Fill-Rounded $g $shade 184 258 52 28 8
    $g.DrawLine((Pen "#ffffff" 2), 196, 220, 188, 250)
    $g.DrawLine((Pen "#ffffff" 2), 224, 220, 232, 250)
    $g.FillEllipse($hi, 198, 250, 6, 6)
    $g.FillEllipse($hi, 216, 250, 6, 6)
  } elseif ($mode -eq "cardigan") {
    $p = Path-Body @((New-Object Drawing.PointF 170,190),(New-Object Drawing.PointF 250,190),(New-Object Drawing.PointF 256,316),(New-Object Drawing.PointF 164,316))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawLine((Pen "#ffffff" 4), 210, 198, 210, 312)
    for ($y = 224; $y -le 286; $y += 20) { $g.FillEllipse($hi, 204, $y, 7, 7) }
    $g.DrawLine((Pen "#777777" 2), 174, 212, 198, 238)
    $g.DrawLine((Pen "#777777" 2), 246, 212, 222, 238)
    $g.DrawLine((Pen "#eeeeee" 2), 172, 296, 248, 296)
  } elseif ($mode -eq "turtleneck") {
    Fill-Rounded $g $main 172 204 76 108 16
    Fill-Rounded $g $main 190 182 40 34 10
    Stroke-Rounded $g $line 168 204 84 108 16
    $g.DrawLine((Pen "#ffffff" 2), 184, 224, 184, 300)
    $g.DrawLine((Pen "#ffffff" 2), 236, 224, 236, 300)
  } elseif ($mode -eq "mock-neck") {
    $p = Path-Body @((New-Object Drawing.PointF 174,190),(New-Object Drawing.PointF 246,190),(New-Object Drawing.PointF 252,310),(New-Object Drawing.PointF 168,310))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    Fill-Rounded $g $hi 192 188 36 22 8
    $g.DrawLine((Pen "#ffffff" 2), 174, 226, 246, 226)
  } elseif ($mode -eq "sweater") {
    $p = Path-Body @((New-Object Drawing.PointF 170,190),(New-Object Drawing.PointF 250,190),(New-Object Drawing.PointF 258,318),(New-Object Drawing.PointF 162,318))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    for ($y = 214; $y -le 300; $y += 18) { $g.DrawLine((Pen "#eeeeee" 2), 170, $y, 250, $y) }
    Fill-Rounded $g $hi 188 190 44 22 8
  } elseif ($mode -eq "baby-tee") {
    $p = Path-Body @((New-Object Drawing.PointF 176,194),(New-Object Drawing.PointF 244,194),(New-Object Drawing.PointF 248,286),(New-Object Drawing.PointF 172,286))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.FillEllipse($hi, 198, 226, 24, 22)
    $g.DrawLine((Pen "#ffffff" 2), 178, 276, 242, 276)
    $g.DrawArc((Pen "#777777" 2), 156, 202, 32, 36, 270, 90)
    $g.DrawArc((Pen "#777777" 2), 232, 202, 32, 36, 180, 90)
  } elseif ($mode -eq "blazer") {
    $p = Path-Body @((New-Object Drawing.PointF 168,188),(New-Object Drawing.PointF 252,188),(New-Object Drawing.PointF 258,320),(New-Object Drawing.PointF 162,320))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.FillPolygon($hi, @((New-Object Drawing.Point 172,196),(New-Object Drawing.Point 206,238),(New-Object Drawing.Point 206,318),(New-Object Drawing.Point 162,318)))
    $g.FillPolygon($shade, @((New-Object Drawing.Point 248,196),(New-Object Drawing.Point 214,238),(New-Object Drawing.Point 214,318),(New-Object Drawing.Point 258,318)))
    $g.DrawLine((Pen "#ffffff" 3), 210, 210, 210, 318)
    $g.FillEllipse($hi, 200, 258, 7, 7)
    $g.FillEllipse($hi, 214, 278, 7, 7)
  } elseif ($mode -eq "corset") {
    $p = Path-Body @((New-Object Drawing.PointF 178,192),(New-Object Drawing.PointF 242,192),(New-Object Drawing.PointF 250,308),(New-Object Drawing.PointF 170,308))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawLine((Pen "#ffffff" 2), 190, 208, 230, 292)
    $g.DrawLine((Pen "#ffffff" 2), 230, 208, 190, 292)
    $g.DrawLine((Pen "#777777" 2), 178, 220, 178, 298)
    $g.DrawLine((Pen "#777777" 2), 242, 220, 242, 298)
  } elseif ($mode -eq "wrap") {
    $p = Path-Body @((New-Object Drawing.PointF 174,190),(New-Object Drawing.PointF 246,190),(New-Object Drawing.PointF 254,306),(New-Object Drawing.PointF 166,306))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawLine((Pen "#ffffff" 4), 174, 204, 246, 286)
    $g.DrawLine((Pen "#ffffff" 3), 246, 204, 174, 286)
    $g.FillEllipse($hi, 236, 280, 12, 12)
  } else {
    $p = Path-Body @(
      (New-Object Drawing.PointF 176,184),(New-Object Drawing.PointF 244,184),
      (New-Object Drawing.PointF 254,238),(New-Object Drawing.PointF 248,318),
      (New-Object Drawing.PointF 172,318),(New-Object Drawing.PointF 166,238)
    )
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.FillRectangle($hi, 175, 202, 70, 20)
    $g.FillPolygon($shade, @((New-Object Drawing.Point 162,250),(New-Object Drawing.Point 258,250),(New-Object Drawing.Point 248,318),(New-Object Drawing.Point 172,318)))
    $g.DrawLine((Pen "#ffffff" 3), 174, 236, 246, 236)
    $g.DrawLine((Pen "#8a8a8a" 2), 180, 202, 180, 316)
    $g.DrawLine((Pen "#8a8a8a" 2), 240, 202, 240, 316)
    $g.FillEllipse((Brush "#f7f7f7"), 190, 260, 8, 8)
    $g.FillEllipse((Brush "#f7f7f7"), 222, 260, 8, 8)
    $g.DrawArc((Pen "#ffffff" 2), 192, 276, 36, 18, 15, 150)
  }
  if ($mode -eq "armor" -or $mode -eq "blazer") {
    Fill-Rounded $g $hi 190 186 40 28 10
  } elseif ($mode -eq "cardigan" -or $mode -eq "wrap") {
    $g.DrawArc((Pen "#ffffff" 3), 186, 190, 48, 30, 10, 160)
  } else {
    Fill-Rounded $g $hi 190 190 40 18 8
  }
  Save-Layer $bmp $g (Join-Path $root "tops/$name.png")
}

function Draw-Bottom($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#bcbcbc"; $shade = Brush "#747474"; $hi = Brush "#eeeeee"; $line = Pen "#626262" 2
  if ($mode -eq "skirt") {
    $skirt = Path-Body @((New-Object Drawing.PointF 166,308),(New-Object Drawing.PointF 254,308),(New-Object Drawing.PointF 298,410),(New-Object Drawing.PointF 122,410))
    $g.FillPath($main, $skirt); $g.DrawPath($line, $skirt)
    Fill-Rounded $g $shade 166 306 88 16 5
    $g.DrawLine((Pen "#ffffff" 3), 192, 324, 174, 404)
    $g.DrawLine((Pen "#ffffff" 3), 226, 324, 248, 404)
  } elseif ($mode -eq "pants") {
    Fill-Rounded $g $main 154 304 112 32 8
    $leftPant = Path-Body @((New-Object Drawing.PointF 154,306),(New-Object Drawing.PointF 202,306),(New-Object Drawing.PointF 198,414),(New-Object Drawing.PointF 192,534),(New-Object Drawing.PointF 154,534),(New-Object Drawing.PointF 148,414))
    $rightPant = Path-Body @((New-Object Drawing.PointF 218,306),(New-Object Drawing.PointF 266,306),(New-Object Drawing.PointF 272,414),(New-Object Drawing.PointF 266,534),(New-Object Drawing.PointF 228,534),(New-Object Drawing.PointF 222,414))
    $g.FillPath($main, $leftPant)
    $g.FillPath($main, $rightPant)
    $g.DrawPath($line, $leftPant)
    $g.DrawPath($line, $rightPant)
    $g.DrawLine($line, 210, 318, 210, 520)
    $g.FillRectangle($hi, 171, 322, 8, 180)
    $g.FillRectangle($shade, 246, 322, 8, 180)
  } elseif ($mode -eq "cargo") {
    Fill-Rounded $g $main 150 304 120 34 8
    $leftPant = Path-Body @((New-Object Drawing.PointF 150,306),(New-Object Drawing.PointF 204,306),(New-Object Drawing.PointF 202,422),(New-Object Drawing.PointF 198,534),(New-Object Drawing.PointF 146,534),(New-Object Drawing.PointF 144,422))
    $rightPant = Path-Body @((New-Object Drawing.PointF 216,306),(New-Object Drawing.PointF 270,306),(New-Object Drawing.PointF 276,422),(New-Object Drawing.PointF 272,534),(New-Object Drawing.PointF 220,534),(New-Object Drawing.PointF 218,422))
    $g.FillPath($main, $leftPant)
    $g.FillPath($main, $rightPant)
    $g.DrawPath($line, $leftPant)
    $g.DrawPath($line, $rightPant)
    Fill-Rounded $g $shade 166 388 28 34 5
    Fill-Rounded $g $shade 226 388 28 34 5
    $g.DrawLine($line, 210, 318, 210, 526)
    $g.DrawLine((Pen "#eeeeee" 2), 162, 324, 202, 324)
    $g.DrawLine((Pen "#eeeeee" 2), 218, 324, 258, 324)
  } elseif ($mode -eq "wide-leg") {
    Fill-Rounded $g $main 150 304 120 34 8
    $leftPant = Path-Body @((New-Object Drawing.PointF 150,306),(New-Object Drawing.PointF 204,306),(New-Object Drawing.PointF 214,534),(New-Object Drawing.PointF 136,534),(New-Object Drawing.PointF 144,420))
    $rightPant = Path-Body @((New-Object Drawing.PointF 216,306),(New-Object Drawing.PointF 270,306),(New-Object Drawing.PointF 284,534),(New-Object Drawing.PointF 206,534),(New-Object Drawing.PointF 216,420))
    $g.FillPath($main, $leftPant)
    $g.FillPath($main, $rightPant)
    $g.DrawPath($line, $leftPant)
    $g.DrawPath($line, $rightPant)
    $g.DrawLine($line, 210, 318, 210, 528)
    $g.DrawLine((Pen "#ffffff" 2), 178, 322, 170, 520)
    $g.DrawLine((Pen "#ffffff" 2), 242, 322, 250, 520)
  } elseif ($mode -eq "low-rise") {
    Fill-Rounded $g $main 152 316 116 20 7
    $g.FillRectangle($shade, 152, 318, 116, 12)
    $leftPant = Path-Body @((New-Object Drawing.PointF 154,324),(New-Object Drawing.PointF 202,324),(New-Object Drawing.PointF 198,430),(New-Object Drawing.PointF 194,534),(New-Object Drawing.PointF 150,534),(New-Object Drawing.PointF 148,430))
    $rightPant = Path-Body @((New-Object Drawing.PointF 218,324),(New-Object Drawing.PointF 266,324),(New-Object Drawing.PointF 272,430),(New-Object Drawing.PointF 270,534),(New-Object Drawing.PointF 226,534),(New-Object Drawing.PointF 222,430))
    $g.FillPath($main, $leftPant)
    $g.FillPath($main, $rightPant)
    $g.DrawPath($line, $leftPant)
    $g.DrawPath($line, $rightPant)
    $g.DrawLine($line, 210, 332, 210, 522)
    $g.FillEllipse($hi, 207, 320, 6, 6)
  } elseif ($mode -eq "pleated") {
    $pleated = Path-Body @((New-Object Drawing.PointF 166,306),(New-Object Drawing.PointF 254,306),(New-Object Drawing.PointF 292,416),(New-Object Drawing.PointF 128,416))
    $g.FillPath($main, $pleated)
    Fill-Rounded $g $shade 166 306 88 14 5
    for ($x = 160; $x -le 260; $x += 20) { $g.DrawLine((Pen "#ffffff" 2), $x, 322, $x - 12, 410) }
    $g.DrawPolygon($line, @((New-Object Drawing.Point 154,306),(New-Object Drawing.Point 266,306),(New-Object Drawing.Point 286,416),(New-Object Drawing.Point 134,416)))
  } elseif ($mode -eq "plaid") {
    $plaid = Path-Body @((New-Object Drawing.PointF 166,306),(New-Object Drawing.PointF 254,306),(New-Object Drawing.PointF 292,416),(New-Object Drawing.PointF 128,416))
    $g.FillPath($main, $plaid)
    for ($x = 150; $x -le 270; $x += 24) { $g.DrawLine((Pen "#eeeeee" 2), $x, 310, $x + 10, 412) }
    for ($y = 328; $y -le 392; $y += 22) { $g.DrawLine((Pen "#777777" 2), 142, $y, 278, $y) }
    $g.DrawPolygon($line, @((New-Object Drawing.Point 154,306),(New-Object Drawing.Point 266,306),(New-Object Drawing.Point 286,416),(New-Object Drawing.Point 134,416)))
  } else {
    Fill-Rounded $g $main 154 310 112 78 16
    Fill-Rounded $g $shade 166 310 88 14 5
    $g.DrawLine($line, 210, 324, 210, 388)
    $g.FillRectangle($hi, 172, 328, 20, 44)
  }
  Save-Layer $bmp $g (Join-Path $root "bottoms/$name.png")
}

function Draw-Dress($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#bdbdbd"; $shade = Brush "#777777"; $hi = Brush "#f1f1f1"; $line = Pen "#666666" 2
  $top = Path-Body @(
    (New-Object Drawing.PointF 176,188),(New-Object Drawing.PointF 244,188),
    (New-Object Drawing.PointF 252,246),(New-Object Drawing.PointF 248,306),
    (New-Object Drawing.PointF 172,306),(New-Object Drawing.PointF 168,246)
  )
  $g.FillPath($main,$top); $g.DrawPath($line,$top)
  if ($mode -eq "gown") {
    $skirt = Path-Body @((New-Object Drawing.PointF 166,300),(New-Object Drawing.PointF 254,300),(New-Object Drawing.PointF 326,552),(New-Object Drawing.PointF 94,552))
    $g.FillPath($main,$skirt); $g.DrawPath($line,$skirt)
    $g.DrawLine((Pen "#ffffff" 3), 190, 320, 150, 540)
    $g.DrawLine((Pen "#ffffff" 3), 230, 320, 272, 540)
    $g.FillEllipse($hi, 202, 218, 16, 16)
  } elseif ($mode -eq "mini") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 166,298),(New-Object Drawing.Point 254,298),(New-Object Drawing.Point 288,424),(New-Object Drawing.Point 132,424)))
    for ($x = 154; $x -le 254; $x += 20) { $g.DrawLine((Pen "#ffffff" 2), 210, 306, $x, 418) }
    $g.FillEllipse($hi, 198, 222, 10, 10)
    $g.FillEllipse($hi, 214, 222, 10, 10)
  } elseif ($mode -eq "slip") {
    $g.DrawLine((Pen "#ffffff" 2), 184, 190, 164, 298)
    $g.DrawLine((Pen "#ffffff" 2), 236, 190, 256, 298)
    $g.FillPolygon($main, @((New-Object Drawing.Point 168,298),(New-Object Drawing.Point 252,298),(New-Object Drawing.Point 280,462),(New-Object Drawing.Point 140,462)))
    $g.DrawLine((Pen "#ffffff" 3), 170, 320, 248, 450)
    $g.DrawLine((Pen "#eeeeee" 2), 178, 212, 242, 212)
  } elseif ($mode -eq "tutu") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 168,298),(New-Object Drawing.Point 252,298),(New-Object Drawing.Point 312,410),(New-Object Drawing.Point 108,410)))
    $g.FillPolygon($hi, @((New-Object Drawing.Point 154,326),(New-Object Drawing.Point 266,326),(New-Object Drawing.Point 326,438),(New-Object Drawing.Point 94,438)))
    for ($x = 130; $x -le 290; $x += 28) { $g.DrawLine((Pen "#ffffff" 2), 210, 306, $x, 430) }
    $g.FillEllipse($hi, 190, 230, 40, 12)
  } elseif ($mode -eq "pinafore") {
    $g.DrawLine((Pen "#ffffff" 5), 182, 190, 182, 310)
    $g.DrawLine((Pen "#ffffff" 5), 238, 190, 238, 310)
    $g.FillPolygon($main, @((New-Object Drawing.Point 166,298),(New-Object Drawing.Point 254,298),(New-Object Drawing.Point 288,452),(New-Object Drawing.Point 132,452)))
    Fill-Rounded $g $shade 188 342 44 24 5
    $g.FillEllipse($hi, 200, 244, 7, 7)
    $g.FillEllipse($hi, 214, 264, 7, 7)
  } elseif ($mode -eq "lace") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 166,298),(New-Object Drawing.Point 254,298),(New-Object Drawing.Point 296,454),(New-Object Drawing.Point 124,454)))
    for ($x = 142; $x -le 270; $x += 20) { $g.DrawArc((Pen "#ffffff" 2), $x, 438, 20, 18, 180, 180) }
    $g.DrawLine((Pen "#ffffff" 3), 174, 324, 246, 324)
    for ($x = 176; $x -le 232; $x += 14) { $g.DrawArc((Pen "#ffffff" 2), $x, 210, 16, 14, 180, 180) }
  } else {
    $g.FillPolygon($main, @((New-Object Drawing.Point 166,298),(New-Object Drawing.Point 254,298),(New-Object Drawing.Point 312,500),(New-Object Drawing.Point 108,500)))
    $g.FillPolygon($shade, @((New-Object Drawing.Point 150,206),(New-Object Drawing.Point 270,206),(New-Object Drawing.Point 300,510),(New-Object Drawing.Point 120,510)))
    $g.DrawLine((Pen "#ffffff" 3), 178, 230, 150, 490)
    $g.DrawLine((Pen "#ffffff" 3), 242, 230, 270, 490)
  }
  Fill-Rounded $g $shade 166 296 88 14 4
  $g.DrawLine((Pen "#ffffff" 3), 210, 206, 210, 296)
  $g.FillEllipse($hi, 190, 220, 40, 14)
  Save-Layer $bmp $g (Join-Path $root "dresses/$name.png")
}

function Draw-Hair($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#b6b6b6"; $shade = Brush "#666666"; $hi = Brush "#eeeeee"; $line = Pen "#555555" 2
  if ($mode -eq "long") {
    $leftSide = Path-Body @(
      (New-Object Drawing.PointF 142, 60), (New-Object Drawing.PointF 178, 34),
      (New-Object Drawing.PointF 190, 78), (New-Object Drawing.PointF 172, 160),
      (New-Object Drawing.PointF 164, 300), (New-Object Drawing.PointF 146, 356),
      (New-Object Drawing.PointF 120, 304), (New-Object Drawing.PointF 124, 164)
    )
    $rightSide = Path-Body @(
      (New-Object Drawing.PointF 278, 60), (New-Object Drawing.PointF 242, 34),
      (New-Object Drawing.PointF 230, 78), (New-Object Drawing.PointF 248, 160),
      (New-Object Drawing.PointF 256, 300), (New-Object Drawing.PointF 274, 356),
      (New-Object Drawing.PointF 300, 304), (New-Object Drawing.PointF 296, 164)
    )
    $g.FillPath($main, $leftSide)
    $g.FillPath($main, $rightSide)
    $g.DrawPath($line, $leftSide)
    $g.DrawPath($line, $rightSide)
    $g.FillPie($main, 146, 30, 128, 76, 180, 180)
    $g.DrawArc($line, 146, 30, 128, 76, 180, 180)
    $g.FillPolygon((Brush "#d0d0d0"), @((New-Object Drawing.Point 146,92),(New-Object Drawing.Point 130,214),(New-Object Drawing.Point 158,330),(New-Object Drawing.Point 174,204)))
    $g.FillPolygon($shade, @((New-Object Drawing.Point 274,92),(New-Object Drawing.Point 290,214),(New-Object Drawing.Point 262,330),(New-Object Drawing.Point 246,204)))
    $g.DrawLine((Pen "#ffffff" 4), 158, 78, 142, 292)
    $g.DrawLine((Pen "#eeeeee" 3), 262, 78, 278, 292)
    $g.DrawLine((Pen "#666666" 2), 210, 42, 210, 92)
  } elseif ($mode -eq "buns") {
    $g.FillEllipse($main, 118, 64, 54, 54)
    $g.FillEllipse($main, 248, 64, 54, 54)
    $g.FillPie($main, 143, 38, 134, 132, 195, 150)
    $g.DrawArc($line, 143, 38, 134, 132, 195, 150)
  } elseif ($mode -eq "ponytail") {
    $g.FillPie($main, 142, 38, 136, 132, 190, 160)
    Fill-Rounded $g $shade 236 106 34 26 12
    $tail = Path-Body @((New-Object Drawing.PointF 252,116),(New-Object Drawing.PointF 300,154),(New-Object Drawing.PointF 284,286),(New-Object Drawing.PointF 244,346),(New-Object Drawing.PointF 232,226))
    $g.FillPath($main, $tail)
    $g.DrawPath($line, $tail)
    $g.DrawLine((Pen "#eeeeee" 3), 266, 146, 252, 314)
    $g.DrawArc($line, 142, 38, 136, 132, 190, 160)
  } elseif ($mode -eq "braids") {
    $g.FillPie($main, 142, 38, 136, 132, 190, 160)
    Fill-Rounded $g $main 146 128 24 160 12
    Fill-Rounded $g $main 250 128 24 160 12
    for ($i = 0; $i -lt 6; $i++) {
      $y = 138 + $i * 24
      $g.DrawLine((Pen "#666666" 3), 148, $y, 170, $y + 18)
      $g.DrawLine((Pen "#666666" 3), 170, $y, 148, $y + 18)
      $g.DrawLine((Pen "#666666" 3), 252, $y, 274, $y + 18)
      $g.DrawLine((Pen "#666666" 3), 274, $y, 252, $y + 18)
    }
    $g.FillEllipse($shade, 150, 280, 18, 14)
    $g.FillEllipse($shade, 252, 280, 18, 14)
  } elseif ($mode -eq "claw-clip") {
    $g.FillPie($main, 142, 38, 136, 132, 190, 160)
    $g.FillEllipse($main, 178, 84, 64, 58)
    $g.DrawEllipse($line, 178, 84, 64, 58)
    Fill-Rounded $g $hi 194 86 32 38 8
    $g.DrawLine($line, 202, 90, 202, 122)
    $g.DrawLine($line, 218, 90, 218, 122)
    $g.DrawArc($line, 142, 38, 136, 132, 190, 160)
  } else {
    $g.FillPie($main, 142, 38, 136, 132, 190, 160)
    $g.FillRectangle($main, 142, 82, 30, 112)
    $g.FillRectangle($main, 248, 82, 30, 112)
    $g.FillEllipse($shade, 146, 134, 20, 54)
    $g.FillEllipse($shade, 254, 134, 20, 54)
    $g.DrawArc($line, 142, 38, 136, 132, 190, 160)
  }
  Save-Layer $bmp $g (Join-Path $root "hair/$name.png")
}

function Draw-Bangs($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#b6b6b6"; $shade = Brush "#666666"; $hi = Brush "#eeeeee"; $line = Pen "#555555" 2
  if ($mode -eq "straight") {
    $g.FillPie($main, 150, 38, 120, 92, 180, 180)
    $g.FillRectangle($main, 160, 82, 100, 40)
    for ($x = 162; $x -le 248; $x += 18) { $g.DrawLine((Pen "#666666" 2), $x, 72, $x + 2, 124) }
    $g.DrawArc($line, 150, 38, 120, 92, 180, 180)
  } elseif ($mode -eq "heavy-straight") {
    $g.FillPie($main, 146, 34, 128, 112, 180, 180)
    $g.FillRectangle($main, 156, 78, 108, 52)
    for ($x = 160; $x -le 252; $x += 14) { $g.DrawLine((Pen "#666666" 2), $x, 64, $x + 1, 132) }
    $g.DrawArc($line, 146, 34, 128, 112, 180, 180)
    $g.DrawLine($line, 160, 128, 260, 128)
  } elseif ($mode -eq "side-swept") {
    $p = Path-Body @((New-Object Drawing.PointF 150,70),(New-Object Drawing.PointF 220,38),(New-Object Drawing.PointF 270,76),(New-Object Drawing.PointF 184,134))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawLine((Pen "#eeeeee" 3), 190, 58, 164, 120)
  } elseif ($mode -eq "curtain") {
    $g.FillPie($main, 146, 40, 70, 102, 185, 170)
    $g.FillPie($main, 204, 40, 70, 102, 185, 170)
    $g.DrawLine((Pen "#666666" 2), 210, 46, 210, 136)
    $g.DrawArc($line, 146, 40, 70, 102, 185, 170)
    $g.DrawArc($line, 204, 40, 70, 102, 185, 170)
  } elseif ($mode -eq "wispy") {
    $g.FillPie($main, 152, 42, 116, 84, 180, 180)
    for ($x = 166; $x -le 250; $x += 16) {
      $g.FillPolygon($main, @((New-Object Drawing.Point $x, 72),(New-Object Drawing.Point ($x + 9), 72),(New-Object Drawing.Point ($x + 4), 132)))
      $g.DrawLine((Pen "#666666" 1), $x + 4, 74, $x + 4, 128)
    }
    $g.DrawArc($line, 152, 42, 116, 84, 180, 180)
  } elseif ($mode -eq "layered") {
    $p = Path-Body @((New-Object Drawing.PointF 146,68),(New-Object Drawing.PointF 188,38),(New-Object Drawing.PointF 236,40),(New-Object Drawing.PointF 274,74),(New-Object Drawing.PointF 238,132),(New-Object Drawing.PointF 210,104),(New-Object Drawing.PointF 182,136))
    $g.FillPath($main,$p); $g.DrawPath($line,$p)
    $g.DrawLine((Pen "#eeeeee" 3), 184, 54, 164, 126)
    $g.DrawLine((Pen "#eeeeee" 3), 236, 54, 258, 126)
  } else {
    $g.FillPie($main, 150, 38, 120, 108, 180, 180)
    $g.FillPie($main, 164, 82, 38, 54, 0, 180)
    $g.FillPie($main, 218, 82, 38, 54, 0, 180)
    $g.DrawArc($line, 150, 38, 120, 108, 180, 180)
    $g.DrawArc($line, 164, 82, 38, 54, 0, 180)
    $g.DrawArc($line, 218, 82, 38, 54, 0, 180)
  }
  Save-Layer $bmp $g (Join-Path $root "bangs/$name.png")
}

function Draw-Makeup($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#c8c8c8"; $hi = Brush "#f4f4f4"
  if ($mode -eq "liner") {
    $g.DrawLine((Pen "#4a4a4a" 2), 176, 101, 201, 106)
    $g.DrawLine((Pen "#4a4a4a" 2), 219, 106, 244, 101)
  } elseif ($mode -eq "glam") {
    $g.DrawLine((Pen "#4a4a4a" 3), 176, 101, 202, 108)
    $g.DrawLine((Pen "#4a4a4a" 3), 218, 108, 244, 101)
    $g.FillEllipse($hi, 188, 94, 5, 5)
    $g.FillEllipse($hi, 228, 94, 5, 5)
  } elseif ($mode -eq "goth") {
    $g.DrawLine((Pen "#383838" 3), 174, 101, 204, 109)
    $g.DrawLine((Pen "#383838" 3), 216, 109, 246, 101)
    $g.DrawLine((Pen "#555555" 2), 196, 134, 224, 134)
  } elseif ($mode -eq "blush") {
    $g.FillEllipse($main, 174, 124, 24, 12)
    $g.FillEllipse($main, 222, 124, 24, 12)
  } else {
    $g.FillEllipse($hi, 166, 124, 12, 6)
    $g.FillEllipse($hi, 242, 124, 12, 6)
  }
  Save-Layer $bmp $g (Join-Path $root "makeup/$name.png")
}

function Draw-Shoes($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#b8b8b8"; $shade = Brush "#696969"; $hi = Brush "#f2f2f2"; $line = Pen "#606060" 2
  $g.TranslateTransform(0, 50)
  if ($mode -eq "boots") {
    Fill-Rounded $g $main 146 492 48 68 16
    Fill-Rounded $g $main 230 492 48 68 16
    $g.FillRectangle($shade, 148, 494, 44, 10)
    $g.FillRectangle($shade, 232, 494, 44, 10)
    $g.DrawLine((Pen "#eeeeee" 2), 156, 512, 184, 512)
    $g.DrawLine((Pen "#eeeeee" 2), 240, 512, 268, 512)
    Stroke-Rounded $g $line 146 492 48 68 16
    Stroke-Rounded $g $line 230 492 48 68 16
  } elseif ($mode -eq "heels") {
    $leftHeel = Path-Body @((New-Object Drawing.PointF 146,518),(New-Object Drawing.PointF 192,516),(New-Object Drawing.PointF 204,548),(New-Object Drawing.PointF 136,548))
    $rightHeel = Path-Body @((New-Object Drawing.PointF 230,518),(New-Object Drawing.PointF 276,516),(New-Object Drawing.PointF 284,548),(New-Object Drawing.PointF 220,548))
    $g.FillPath($main, $leftHeel)
    $g.FillPath($main, $rightHeel)
    $g.DrawLine((Pen "#696969" 3), 192, 546, 186, 580)
    $g.DrawLine((Pen "#696969" 3), 260, 546, 266, 580)
    $g.DrawLine((Pen "#ffffff" 2), 152, 524, 188, 524)
    $g.DrawLine((Pen "#ffffff" 2), 234, 524, 270, 524)
  } elseif ($mode -eq "loafers") {
    Fill-Rounded $g $main 136 516 66 40 13
    Fill-Rounded $g $main 224 516 66 40 13
    Fill-Rounded $g $shade 146 528 42 10 4
    Fill-Rounded $g $shade 234 528 42 10 4
    $g.DrawLine((Pen "#ffffff" 2), 150, 542, 188, 542)
    $g.DrawLine((Pen "#ffffff" 2), 238, 542, 276, 542)
    Stroke-Rounded $g $line 136 516 66 40 13
    Stroke-Rounded $g $line 224 516 66 40 13
  } elseif ($mode -eq "ballet-flats") {
    Fill-Rounded $g $main 138 522 62 30 15
    Fill-Rounded $g $main 226 522 62 30 15
    $g.DrawLine((Pen "#ffffff" 2), 150, 522, 188, 550)
    $g.DrawLine((Pen "#ffffff" 2), 188, 522, 150, 550)
    $g.DrawLine((Pen "#ffffff" 2), 238, 522, 276, 550)
    $g.DrawLine((Pen "#ffffff" 2), 276, 522, 238, 550)
    $g.FillEllipse($hi, 166, 528, 10, 10)
    $g.FillEllipse($hi, 254, 528, 10, 10)
    Stroke-Rounded $g $line 138 522 62 30 15
    Stroke-Rounded $g $line 226 522 62 30 15
  } elseif ($mode -eq "chunky") {
    Fill-Rounded $g $main 130 512 76 44 18
    Fill-Rounded $g $main 220 512 76 44 18
    Fill-Rounded $g $hi 134 544 70 12 5
    Fill-Rounded $g $hi 224 544 70 12 5
    $g.DrawLine((Pen "#ffffff" 3), 160, 528, 196, 540)
    $g.DrawLine((Pen "#ffffff" 3), 196, 528, 160, 540)
    $g.DrawLine((Pen "#ffffff" 3), 230, 528, 266, 540)
    $g.DrawLine((Pen "#ffffff" 3), 266, 528, 230, 540)
    $g.FillRectangle($shade, 166, 516, 28, 7)
    $g.FillRectangle($shade, 236, 516, 28, 7)
    Stroke-Rounded $g $line 130 512 76 44 18
    Stroke-Rounded $g $line 220 512 76 44 18
  } elseif ($mode -eq "platform") {
    Fill-Rounded $g $main 136 514 66 42 14
    Fill-Rounded $g $main 224 514 66 42 14
    Fill-Rounded $g $shade 138 546 64 12 5
    Fill-Rounded $g $shade 226 546 64 12 5
    $g.FillRectangle($hi, 158, 520, 34, 7)
    $g.FillRectangle($hi, 226, 520, 34, 7)
    $g.DrawLine((Pen "#ffffff" 2), 160, 532, 196, 548)
    $g.DrawLine((Pen "#ffffff" 2), 230, 532, 266, 548)
    Stroke-Rounded $g $line 136 514 66 42 14
    Stroke-Rounded $g $line 224 514 66 42 14
  } else {
    Fill-Rounded $g $main 136 518 66 36 18
    Fill-Rounded $g $main 224 518 66 36 18
    Fill-Rounded $g $hi 140 543 60 9 4
    Fill-Rounded $g $hi 228 543 60 9 4
    $g.FillRectangle($shade, 166, 523, 28, 6)
    $g.FillRectangle($shade, 234, 523, 28, 6)
    $g.DrawLine((Pen "#ffffff" 2), 166, 532, 194, 540)
    $g.DrawLine((Pen "#ffffff" 2), 194, 532, 166, 540)
    $g.DrawLine((Pen "#ffffff" 2), 234, 532, 262, 540)
    $g.DrawLine((Pen "#ffffff" 2), 262, 532, 234, 540)
    $g.DrawArc((Pen "#eeeeee" 2), 151, 525, 42, 18, 200, 110)
    $g.DrawArc((Pen "#eeeeee" 2), 219, 525, 42, 18, 200, 110)
    if ($mode -eq "sneakers-star") {
      $g.FillPolygon($hi, @((New-Object Drawing.Point 183,526),(New-Object Drawing.Point 187,534),(New-Object Drawing.Point 196,535),(New-Object Drawing.Point 189,540),(New-Object Drawing.Point 191,548),(New-Object Drawing.Point 183,543),(New-Object Drawing.Point 175,548),(New-Object Drawing.Point 177,540),(New-Object Drawing.Point 170,535),(New-Object Drawing.Point 179,534)))
      $g.FillPolygon($hi, @((New-Object Drawing.Point 251,526),(New-Object Drawing.Point 255,534),(New-Object Drawing.Point 264,535),(New-Object Drawing.Point 257,540),(New-Object Drawing.Point 259,548),(New-Object Drawing.Point 251,543),(New-Object Drawing.Point 243,548),(New-Object Drawing.Point 245,540),(New-Object Drawing.Point 238,535),(New-Object Drawing.Point 247,534)))
    } elseif ($mode -eq "sneakers-heart") {
      $g.FillEllipse($hi, 174, 530, 10, 10)
      $g.FillEllipse($hi, 184, 530, 10, 10)
      $g.FillPolygon($hi, @((New-Object Drawing.Point 174,536),(New-Object Drawing.Point 194,536),(New-Object Drawing.Point 184,548)))
      $g.FillEllipse($hi, 242, 530, 10, 10)
      $g.FillEllipse($hi, 252, 530, 10, 10)
      $g.FillPolygon($hi, @((New-Object Drawing.Point 242,536),(New-Object Drawing.Point 262,536),(New-Object Drawing.Point 252,548)))
    } else {
      $g.DrawLine((Pen "#f7f7f7" 3), 152, 530, 204, 530)
      $g.DrawLine((Pen "#f7f7f7" 3), 220, 530, 272, 530)
      $g.FillEllipse($hi, 199, 533, 6, 6)
      $g.FillEllipse($hi, 267, 533, 6, 6)
    }
    Stroke-Rounded $g $line 136 520 66 34 16
    Stroke-Rounded $g $line 224 520 66 34 16
  }
  Save-Layer $bmp $g (Join-Path $root "shoes/$name.png")
}

function Draw-Accessory($name, $mode) {
  $layer = New-Layer; $bmp = $layer[0]; $g = $layer[1]
  $main = Brush "#bdbdbd"; $shade = Brush "#777777"; $hi = Brush "#ffffff"; $line = Pen "#666666" 2
  if ($mode -eq "crown") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 166,26),(New-Object Drawing.Point 186,64),(New-Object Drawing.Point 210,20),(New-Object Drawing.Point 234,64),(New-Object Drawing.Point 254,26),(New-Object Drawing.Point 248,78),(New-Object Drawing.Point 172,78)))
    $g.FillEllipse($hi, 204, 32, 12, 12)
  } elseif ($mode -eq "tiara") {
    $g.DrawArc((Pen "#777777" 6), 162, 34, 96, 58, 190, 160)
    $g.FillEllipse($hi, 184, 52, 10, 10)
    $g.FillEllipse($hi, 206, 42, 12, 12)
    $g.FillEllipse($hi, 230, 52, 10, 10)
  } elseif ($mode -eq "headband") {
    $g.DrawArc((Pen "#777777" 8), 150, 46, 120, 96, 205, 130)
    $g.DrawArc((Pen "#ffffff" 3), 154, 50, 112, 86, 205, 130)
  } elseif ($mode -eq "flower") {
    for ($i = 0; $i -lt 6; $i++) {
      $angle = $i * 60 * [Math]::PI / 180
      $x = 236 + [Math]::Cos($angle) * 11
      $y = 62 + [Math]::Sin($angle) * 11
      $g.FillEllipse($main, $x - 7, $y - 7, 14, 14)
    }
    $g.FillEllipse($hi, 231, 57, 10, 10)
  } elseif ($mode -eq "hat") {
    Fill-Rounded $g $main 164 30 92 42 14
    Fill-Rounded $g $shade 148 66 124 14 6
    $g.DrawLine((Pen "#ffffff" 3), 174, 58, 246, 58)
  } elseif ($mode -eq "glasses") {
    $g.DrawEllipse((Pen "#777777" 6), 170, 104, 34, 24)
    $g.DrawEllipse((Pen "#777777" 6), 216, 104, 34, 24)
    $g.DrawLine((Pen "#777777" 5), 204, 116, 216, 116)
  } elseif ($mode -eq "wings") {
    $g.FillEllipse($main, 74, 216, 108, 196)
    $g.FillEllipse($main, 238, 216, 108, 196)
    $g.FillEllipse((Brush "#ffffffaa"), 98, 240, 56, 118)
    $g.FillEllipse((Brush "#ffffffaa"), 266, 240, 56, 118)
  } elseif ($mode -eq "cape") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 150,196),(New-Object Drawing.Point 270,196),(New-Object Drawing.Point 326,540),(New-Object Drawing.Point 94,540)))
    $g.FillPolygon($shade, @((New-Object Drawing.Point 210,204),(New-Object Drawing.Point 270,196),(New-Object Drawing.Point 326,540),(New-Object Drawing.Point 230,520)))
  } elseif ($mode -eq "bow") {
    $g.FillPolygon($main, @((New-Object Drawing.Point 184,36),(New-Object Drawing.Point 210,52),(New-Object Drawing.Point 184,70),(New-Object Drawing.Point 160,52)))
    $g.FillPolygon($main, @((New-Object Drawing.Point 236,36),(New-Object Drawing.Point 210,52),(New-Object Drawing.Point 236,70),(New-Object Drawing.Point 260,52)))
    $g.FillEllipse($hi, 202, 44, 16, 16)
    $g.DrawPolygon($line, @((New-Object Drawing.Point 184,36),(New-Object Drawing.Point 210,52),(New-Object Drawing.Point 184,70),(New-Object Drawing.Point 160,52)))
    $g.DrawPolygon($line, @((New-Object Drawing.Point 236,36),(New-Object Drawing.Point 210,52),(New-Object Drawing.Point 236,70),(New-Object Drawing.Point 260,52)))
  } elseif ($mode -eq "pearls") {
    for ($i = 0; $i -lt 11; $i++) {
      $x = 178 + $i * 7
      $y = 178 + [Math]::Abs($i - 5) * 2
      $g.FillEllipse($hi, $x, $y, 8, 8)
      $g.DrawEllipse($line, $x, $y, 8, 8)
    }
  } elseif ($mode -eq "bag") {
    Fill-Rounded $g $main 260 286 58 70 10
    $g.DrawArc($line, 268, 250, 42, 60, 200, 140)
    Fill-Rounded $g $shade 272 306 34 12 4
    $g.FillEllipse($hi, 286, 332, 8, 8)
  } elseif ($mode -eq "choker") {
    Fill-Rounded $g $main 184 174 52 10 5
    $g.FillEllipse($hi, 204, 174, 12, 12)
  } elseif ($mode -eq "headset") {
    $g.DrawArc((Pen "#777777" 6), 154, 42, 112, 96, 200, 140)
    Fill-Rounded $g $main 144 96 20 38 7
    Fill-Rounded $g $main 256 96 20 38 7
    $g.DrawLine((Pen "#777777" 4), 266, 140, 246, 156)
    $g.FillEllipse($hi, 240, 152, 10, 10)
  } else {
    $g.DrawArc((Pen "#777777" 5), 184, 174, 52, 52, 20, 140)
    $g.FillEllipse($main, 204, 210, 14, 18)
    $g.FillEllipse($hi, 208, 214, 5, 5)
  }
  Save-Layer $bmp $g (Join-Path $root "accessories/$name.png")
}

Draw-BodyPart "left-leg"
Draw-BodyPart "right-leg"
Draw-BodyPart "left-arm"
Draw-BodyPart "right-arm"
Draw-BodyPart "torso"
Draw-BodyPart "head"
Draw-Face
Draw-BaseBodysuit
Draw-Hair "short" "short"
Draw-Hair "long" "long"
Draw-Hair "buns" "buns"
Draw-Hair "ponytail" "ponytail"
Draw-Hair "braids" "braids"
Draw-Hair "claw-clip" "claw-clip"
Draw-Bangs "straight" "straight"
Draw-Bangs "side-swept" "side-swept"
Draw-Bangs "curtain" "curtain"
Draw-Bangs "rounded" "rounded"
Draw-Bangs "heavy-straight" "heavy-straight"
Draw-Bangs "wispy" "wispy"
Draw-Bangs "layered" "layered"
Draw-Makeup "glow" "glow"
Draw-Makeup "liner" "liner"
Draw-Makeup "blush" "blush"
Draw-Makeup "glam" "glam"
Draw-Makeup "goth" "goth"
Draw-Top "shirt" "shirt"
Draw-Top "jacket" "jacket"
Draw-Top "armor" "armor"
Draw-Top "hoodie" "hoodie"
Draw-Top "cardigan" "cardigan"
Draw-Top "turtleneck" "turtleneck"
Draw-Top "mock-neck" "mock-neck"
Draw-Top "sweater" "sweater"
Draw-Top "baby-tee" "baby-tee"
Draw-Top "blazer" "blazer"
Draw-Top "corset" "corset"
Draw-Top "wrap" "wrap"
Draw-Bottom "skirt" "skirt"
Draw-Bottom "pants" "pants"
Draw-Bottom "shorts" "shorts"
Draw-Bottom "cargo" "cargo"
Draw-Bottom "wide-leg" "wide-leg"
Draw-Bottom "low-rise" "low-rise"
Draw-Bottom "pleated" "pleated"
Draw-Bottom "plaid" "plaid"
Draw-Dress "gown" "gown"
Draw-Dress "mini" "mini"
Draw-Dress "cape" "cape"
Draw-Dress "slip" "slip"
Draw-Dress "tutu" "tutu"
Draw-Dress "pinafore" "pinafore"
Draw-Dress "lace" "lace"
Draw-Shoes "boots" "boots"
Draw-Shoes "sneakers" "sneakers"
Draw-Shoes "sneakers-star" "sneakers-star"
Draw-Shoes "sneakers-heart" "sneakers-heart"
Draw-Shoes "heels" "heels"
Draw-Shoes "platform" "platform"
Draw-Shoes "loafers" "loafers"
Draw-Shoes "ballet-flats" "ballet-flats"
Draw-Shoes "chunky" "chunky"
Draw-Accessory "crown" "crown"
Draw-Accessory "tiara" "tiara"
Draw-Accessory "headband" "headband"
Draw-Accessory "flower" "flower"
Draw-Accessory "hat" "hat"
Draw-Accessory "glasses" "glasses"
Draw-Accessory "wings" "wings"
Draw-Accessory "cape" "cape"
Draw-Accessory "necklace" "necklace"
Draw-Accessory "bow" "bow"
Draw-Accessory "pearls" "pearls"
Draw-Accessory "bag" "bag"
Draw-Accessory "choker" "choker"
Draw-Accessory "headset" "headset"

Write-Host "Generated Style Rush PNG assets in $root"
