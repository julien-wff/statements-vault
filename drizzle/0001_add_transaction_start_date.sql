CREATE TABLE transaction_dg_tmp
(
    id                           INTEGER NOT NULL
        PRIMARY KEY AUTOINCREMENT,
    accountId                    INTEGER NOT NULL
        REFERENCES account,
    fileId                       INTEGER NOT NULL
        REFERENCES file,
    startDate                    TEXT    NOT NULL,
    endDate                      TEXT    NOT NULL,
    amount                       numeric NOT NULL,
    currency                     TEXT    NOT NULL,
    description                  TEXT    NOT NULL,
    subCategoryId                TEXT
        REFERENCES sub_category,
    predictedBalance             numeric,
    withCategoryRule             INTEGER
        REFERENCES category_rule,
    transferSourceAccountId      INTEGER
        REFERENCES account,
    transferDestinationAccountId INTEGER
        REFERENCES account
);

INSERT INTO transaction_dg_tmp(id, accountId, fileId, startDate, endDate, amount, currency, description, subCategoryId,
                               predictedBalance, withCategoryRule, transferSourceAccountId,
                               transferDestinationAccountId)
SELECT id,
       accountId,
       fileId,
       date,
       date,
       amount,
       currency,
       description,
       subCategoryId,
       predictedBalance,
       withCategoryRule,
       transferSourceAccountId,
       transferDestinationAccountId
FROM "transaction";

DROP TABLE "transaction";

ALTER TABLE transaction_dg_tmp
    RENAME TO "transaction";
