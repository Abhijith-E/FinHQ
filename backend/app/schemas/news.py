from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class NewsSentimentBase(BaseModel):
    sentiment_score: float
    sentiment_label: str

class NewsSentimentCreate(NewsSentimentBase):
    pass

class NewsSentiment(NewsSentimentBase):
    id: int
    article_id: int

    class Config:
        from_attributes = True

class NewsArticleBase(BaseModel):
    title: str
    content: str
    url: str
    source: str
    published_at: Optional[datetime] = None

class NewsArticleCreate(NewsArticleBase):
    pass

class NewsArticle(NewsArticleBase):
    id: int
    sentiment: Optional[NewsSentiment] = None

    class Config:
        from_attributes = True
