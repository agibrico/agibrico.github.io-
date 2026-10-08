$sourceDir = "."
$destZip = ".artifacts/scratch/agb-vcard-studio-source.zip"

if (Test-Path $destZip) {
    Remove-Item $destZip
}

$exclude = @("node_modules", ".git", "dist", "build", ".idea", "android/.gradle", "android/app/build")

$files = Get-ChildItem -Path $sourceDir | Where-Object {
    $name = $_.Name
    $exclude -notcontains $name
}

Compress-Archive -Path $files.FullName -DestinationPath $destZip -Force
Write-Output "Zipped successfully to $destZip"
