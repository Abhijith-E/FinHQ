from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    url = Column(String, unique=True, index=True)
    source = Column(String)
    published_at = Column(DateTime, default=datetime.utcnow)
    
    sentiment = relationship("NewsSentiment", back_populates="article", uselist=False)

class NewsSentiment(Base):
    __tablename__ = "news_sentiments"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id"))
    sentiment_score = Column(Float) # -1.0 to 1.0 or probability
    sentiment_label = Column(String) # positive, negative, neutral
    
    article = relationship("NewsArticle", back_populates="sentiment")
