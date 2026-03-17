$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Old divider (flexible match for ../ or ../../ etc)
$oldPattern = '<img\s+class="divider"\s+src="[^"]*divider-wingwave\.svg"\s+alt=""\s+aria-hidden="true"\s*/?>'

# New divider block
$newDivider = @'
<div class="section-divider section-wave-divider divider-to-footer" aria-hidden="true">
  <svg class="divider-svg divider-desktop" viewBox="0 0 1440 140" preserveAspectRatio="none" focusable="false" aria-hidden="true">
    <path d="M0,32L60,42.7C120,53,240,75,360,90.7C480,107,600,117,720,112C840,107,960,85,1080,69.3C1200,53,1320,43,1380,37.3L1440,32L1440,141L0,141Z"></path>
  </svg>
  <svg class="divider-svg divider-mobile" viewBox="0 0 1440 140" preserveAspectRatio="none" focusable="false" aria-hidden="true">
    <path d="M0,72L80,85C160,99,320,125,480,125C640,125,800,99,960,77C1120,56,1280,40,1360,32L1440,24L1440,141L0,141Z"></path>
  </svg>
</div>
'@

# Get all HTML files
$files = Get-ChildItem -Path $root -Recurse -Filter *.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    $content = [regex]::Replace($content, $oldPattern, $newDivider)

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated divider in: $($file.FullName)"
    }
}

Write-Host "Done replacing dividers."