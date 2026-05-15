Add-Type -AssemblyName System.Drawing

$primary = [System.Drawing.Color]::FromArgb(27, 73, 140)  # #1B498C (brand navy)
$white   = [System.Drawing.Color]::White

$assetsDir = Join-Path $PSScriptRoot "..\apps\mobile\assets"
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

function New-IconPng {
    param([int]$Size, [string]$OutPath, [bool]$DrawLetter = $true)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $brush = New-Object System.Drawing.SolidBrush($primary)
    $g.FillRectangle($brush, 0, 0, $Size, $Size)

    if ($DrawLetter) {
        $fontSize = [int]($Size * 0.55)
        $font  = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $wbr   = New-Object System.Drawing.SolidBrush($white)
        $sf    = New-Object System.Drawing.StringFormat
        $sf.Alignment     = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
        $g.DrawString("I", $font, $wbr, $rect, $sf)
        $font.Dispose(); $wbr.Dispose(); $sf.Dispose()
    }

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $brush.Dispose()
    Write-Host "  [ok] $OutPath"
}

Write-Host "Gerando assets placeholder em $assetsDir"
New-IconPng -Size 1024 -OutPath (Join-Path $assetsDir "icon.png")
New-IconPng -Size 1024 -OutPath (Join-Path $assetsDir "adaptive-icon.png")
New-IconPng -Size 1284 -OutPath (Join-Path $assetsDir "splash.png")
New-IconPng -Size 48   -OutPath (Join-Path $assetsDir "favicon.png") -DrawLetter $false
Write-Host "Done."
