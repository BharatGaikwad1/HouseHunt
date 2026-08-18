$zipUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.4.zip"
$zipPath = "c:\Users\bhara\OneDrive\Documents\MongoDB\mongodb-temp.zip"
$extractPath = "c:\Users\bhara\OneDrive\Documents\MongoDB\mongodb-temp"
$destPath = "c:\Users\bhara\OneDrive\Documents\MongoDB\mongodb-bin"
$dataPath = "c:\Users\bhara\OneDrive\Documents\MongoDB\db-data"

# Create data directory if not exists
if (!(Test-Path $dataPath)) {
    Write-Host "Creating DB data folder..."
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

# If destination bin folder doesn't exist, download and extract
if (!(Test-Path $destPath)) {
    Write-Host "Downloading MongoDB ZIP from $zipUrl ..."
    # Use WebClient or Invoke-WebRequest
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

    Write-Host "Extracting ZIP archive..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

    Write-Host "Moving binaries..."
    # Find the child directory (usually mongodb-windows-x86_64-8.0.4)
    $subDir = Get-ChildItem -Path $extractPath -Directory | Select-Object -First 1
    Move-Item -Path "$($subDir.FullName)" -Destination $destPath

    Write-Host "Cleaning up temporary files..."
    Remove-Item -Path $zipPath -Force
    Remove-Item -Path $extractPath -Recurse -Force
    Write-Host "MongoDB portable setup complete!"
} else {
    Write-Host "MongoDB binaries already exist in $destPath."
}
