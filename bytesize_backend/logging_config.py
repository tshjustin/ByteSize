import logging

def setup_logging():
    logging.basicConfig(level=logging.INFO) # DEBUG, INFO, WARNING, ERROR, CRITICAL)
    logger = logging.getLogger(__name__)
    return logger