DECLARE @i INT = 1;
DECLARE @name NVARCHAR(255);
DECLARE @model NVARCHAR(255);
DECLARE @brandId INT;
DECLARE @categoryId INT;
DECLARE @colorId INT;
DECLARE @desc NVARCHAR(255);
DECLARE @barcode NVARCHAR(50);
DECLARE @specsId INT;

WHILE @i <= 100000
BEGIN
    -- Generate random parts
    SET @brandId = CASE ABS(CHECKSUM(NEWID())) % 4
        WHEN 0 THEN 96
        WHEN 1 THEN 97
        WHEN 2 THEN 104
        ELSE 1105
    END;

    SET @categoryId = CASE ABS(CHECKSUM(NEWID())) % 7
        WHEN 0 THEN 3
        WHEN 1 THEN 4
        WHEN 2 THEN 5
        WHEN 3 THEN 6
        WHEN 4 THEN 7
        WHEN 5 THEN 8
        ELSE 9
    END;

    SET @colorId = CASE ABS(CHECKSUM(NEWID())) % 2
        WHEN 0 THEN 1
        ELSE 2
    END;

    -- Compose name and model
    SET @name = CONCAT(
        CASE ABS(CHECKSUM(NEWID())) % 5
            WHEN 0 THEN 'Galaxy '
            WHEN 1 THEN 'Air '
            WHEN 2 THEN 'Ultra '
            WHEN 3 THEN 'Pro '
            ELSE 'Max '
        END,
        CASE ABS(CHECKSUM(NEWID())) % 1000
            WHEN 0 THEN 'A'
            ELSE CAST(ABS(CHECKSUM(NEWID())) % 9999 AS NVARCHAR)
        END
    );

    SET @model = CONCAT('M-', ABS(CHECKSUM(NEWID())) % 999999);

    SET @desc = CONCAT(@name, ' random description');

    -- Determine barcode
    IF @categoryId IN (7, 8)
        SET @barcode = CONCAT(ABS(CHECKSUM(NEWID())), ABS(CHECKSUM(NEWID())));
    ELSE
        SET @barcode = NULL;

    -- Generate random specsId between 1 and 9
    SET @specsId = ABS(CHECKSUM(NEWID())) % 8 + 1;

    -- Insert
    INSERT INTO items (Name, model_number, brand_id, category_id, Description, ColorId, Barcode, SpecsId)
    VALUES (@name, @model, @brandId, @categoryId, @desc, @colorId, @barcode, @specsId);

    SET @i = @i + 1;
END;
