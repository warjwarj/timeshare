from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
import os

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
  model_config = SettingsConfigDict(
      env_file="./.env.dev", env_file_encoding="utf-8", case_sensitive=True
  )

  API_VERSION: str
  PROJECT_NAME: str
  ENV: str
  SECRET_KEY: str
  ALGORITHM: str
  ACCESS_TOKEN_EXPIRE_MINUTES: int

  SERVER_HOST: str
  SERVER_PORT: int

  POSTGRES_USER: str
  POSTGRES_PASSWORD: str
  POSTGRES_HOST: str
  POSTGRES_PORT: int
  POSTGRES_DB: str

class ContainerDevSettings(Settings):
  model_config = SettingsConfigDict(
    env_file="./.env.dev", env_file_encoding="utf-8", case_sensitive=True
  )
  ENV: str = "dev"


class ContainerTestSettings(Settings):
  model_config = SettingsConfigDict(
    env_file="./.env.test", env_file_encoding="utf-8", case_sensitive=True
  )
  ENV: str = "test"


class LocalTestSettings(Settings):
  model_config = SettingsConfigDict(
    env_file="./.env.test.local", env_file_encoding="utf-8", case_sensitive=True
  )
  ENV: str = "test"


class LocalDevSettings(Settings):
  model_config = SettingsConfigDict(
    env_file="./.env.local", env_file_encoding="utf-8", case_sensitive=True
  )
  ENV: str = "local"


def get_settings(env: str = "dev") -> Settings:
  """
  Return the settings object based on the environment.

  Parameters:
      env (str): The environment to retrieve the settings for. Defaults to "dev".

  Returns:
      Settings: The settings object based on the environment.

  Raises:
      ValueError: If the environment is invalid.
  """

  if env.lower() in ["dev", "d", "development"]:
      return ContainerDevSettings()
  if env.lower() in ["test", "t", "testing"]:
      return ContainerTestSettings()
  print(env)
  raise ValueError("Invalid environment. Must be 'dev' or 'test' ,'local'.")

_env = os.environ.get("ENV", "dev")

settings = get_settings(env=_env)