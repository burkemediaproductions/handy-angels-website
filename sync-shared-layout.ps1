$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceFile = Join-Path $root "index.html"

if (-not (Test-Path $sourceFile)) {
    Write-Host "Could not find index.html in $root"
    exit 1
}

$source = Get-Content $sourceFile -Raw

# Extract shared blocks from the source page
$headerPattern = '(?s)<header\b.*?</header>'
$mobileDrawerPattern = '(?s)<!-- Mobile drawer -->\s*<div class="mobile-panel".*?</div>\s*</div>'
$footerPattern = '(?s)<footer\b.*?</footer>'

$headerMatch = [regex]::Match($source, $headerPattern)
$mobileDrawerMatch = [regex]::Match($source, $mobileDrawerPattern)
$footerMatch = [regex]::Match($source, $footerPattern)

if (-not $headerMatch.Success) {
    Write-Host "Could not extract <header>...</header> from index.html"
    exit 1
}

if (-not $mobileDrawerMatch.Success) {
    Write-Host "Could not extract mobile drawer block from index.html"
    exit 1
}

if (-not $footerMatch.Success) {
    Write-Host "Could not extract <footer>...</footer> from index.html"
    exit 1
}

$newHeader = $headerMatch.Value
$newMobileDrawer = $mobileDrawerMatch.Value
$newFooter = $footerMatch.Value

# Process all html files except the source
$files = Get-ChildItem -Path $root -Recurse -Filter *.html | Where-Object { $_.FullName -ne $sourceFile }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Replace header
    $content = [regex]::Replace($content, $headerPattern, $newHeader, 1)

    # Replace mobile drawer
    $content = [regex]::Replace($content, $mobileDrawerPattern, $newMobileDrawer, 1)

    # Replace footer
    $content = [regex]::Replace($content, $footerPattern, $newFooter, 1)

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    } else {
        Write-Host "No changes: $($file.FullName)"
    }
}

Write-Host "Done."