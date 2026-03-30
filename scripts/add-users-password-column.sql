IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'password'
)
BEGIN
  ALTER TABLE dbo.Users ADD password NVARCHAR(255) NULL;
END

