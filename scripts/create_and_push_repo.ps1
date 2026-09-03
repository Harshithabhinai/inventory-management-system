$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrEmpty($token)) { Write-Host 'NO_TOKEN'; exit 2 }
$body = @{ name = 'employee'; private = $false } | ConvertTo-Json
$hdr = @{ Authorization = "token $token"; 'User-Agent' = 'vs-code-agent' }
try {
  $r = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $hdr -Body $body -ErrorAction Stop
  Write-Host "REPO_CREATED $($r.html_url)"
} catch {
  Write-Host "API_ERROR $($_.Exception.Message)"
}
if (-not (Test-Path .git)) { git init -b main }
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue
git add -A
# commit if there are changes
try { git commit -m 'Initial commit: project import' -q } catch { Write-Host 'no commit needed' }
git remote remove origin 2>$null
$remoteUrl = "https://$token@github.com/bunnyjoey3-arch/employee.git"
git remote add origin $remoteUrl
try {
  git push -u origin main --force
  Write-Host 'PUSH_OK'
} catch {
  Write-Host 'PUSH_ERROR' $_.Exception.Message
  exit 5
}
