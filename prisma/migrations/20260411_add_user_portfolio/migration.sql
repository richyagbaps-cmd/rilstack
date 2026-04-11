-- Add user_portfolio table for post-execution updates
CREATE TABLE UserPortfolio (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  productId TEXT NOT NULL,
  invested_amount INT NOT NULL,
  quantity FLOAT NOT NULL,
  purchase_date DATETIME NOT NULL,
  current_value FLOAT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (productId) REFERENCES Product(id)
);
CREATE INDEX idx_user_portfolio_user ON UserPortfolio(userId);
CREATE INDEX idx_user_portfolio_product ON UserPortfolio(productId);
