
IF OBJECT_ID(N'dbo.Favorites', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Favorites (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Favorites_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Favorites PRIMARY KEY (user_id, product_id),
    CONSTRAINT FK_Favorites_User FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Favorites_Product FOREIGN KEY (product_id) REFERENCES dbo.Products(id) ON DELETE CASCADE
  );
END
GO

