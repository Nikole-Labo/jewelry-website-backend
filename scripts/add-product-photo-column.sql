

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'dbo.Products') AND name = N'photo'
)
BEGIN
  ALTER TABLE dbo.Products ADD photo NVARCHAR(260) NULL;
END
