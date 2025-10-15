param(
  [string]$ContainerName = 'mwsi-hris-db-1',
  [string]$DbName = 'mwsi_hris_dev',
  [string]$User = 'devuser'
)

$timestamp = Get-Date -Format 'yyyy-MM-dd'
$outDir = Join-Path $PSScriptRoot '..\database\snapshots'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir "$timestamp-dev-snapshot.sql.gz"

Write-Host "Exporting snapshot to $outFile"

# Export to a temp file in the container, then docker cp to host to preserve binary gzip
$containerTmp = "/tmp/dev-snapshot.sql.gz"
$cmd = "pg_dump -U $User -d $DbName --no-owner --no-privileges --inserts | gzip -c > $containerTmp"

docker exec -e PGPASSWORD=devpass $ContainerName sh -lc "$cmd"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Export failed during pg_dump | gzip"
  exit 1
}

docker cp "$ContainerName:$containerTmp" "$outFile"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to copy snapshot from container"
  exit 1
}

Write-Host "Snapshot written: $outFile"