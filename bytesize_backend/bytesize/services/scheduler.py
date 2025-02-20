import asyncio
from datetime import datetime, time, timedelta

async def daily_query():
    """
    Performs API scrapes daily at 00:00
    """
    while True:  
        now = datetime.now() # if now is 2024-02-20 15:30:00
        target = datetime.combine(now.date() + timedelta(days=1), time()) # target = 2025-02-21: 00:00:00 | (new_date, time()=>00:00)

        seconds_to_target = (target - now).total_seconds()
        await asyncio.sleep(seconds_to_target)
        await pass 