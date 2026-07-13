"""Edge TTS provider."""
from __future__ import annotations

import io
from typing import Any, AsyncGenerator, Dict, Optional

import edge_tts

from core.logger import get_logger
from .base import TTSBase
from .registry import TTSRegistry

logger = get_logger(__name__)


@TTSRegistry.register("edge_tts", "Edge TTS")
class EdgeTTS(TTSBase):
    """Local Edge TTS implementation using the `edge-tts` package."""

    COMMON_VOICES = [
        "zh-CN-XiaoxiaoNeural",
        "zh-CN-XiaoyiNeural",
        "zh-CN-YunjianNeural",
        "zh-CN-YunxiNeural",
        "zh-CN-YunxiaNeural",
        "zh-CN-YunyangNeural",
        "zh-CN-liaoning-XiaobeiNeural",
        "zh-CN-shaanxi-XiaoniNeural",
        "en-US-AriaNeural",
        "en-US-JennyNeural",
        "en-US-GuyNeural",
        "ja-JP-NanamiNeural",
        "ko-KR-SunHiNeural",
    ]

    RATE_OPTIONS = ["-50%", "-25%", "0%", "+25%", "+50%"]
    VOLUME_OPTIONS = ["-50%", "-25%", "0%", "+25%", "+50%"]
    PITCH_OPTIONS = ["-20Hz", "-10Hz", "0Hz", "+10Hz", "+20Hz"]

    @classmethod
    def get_config_template(cls) -> Dict[str, Any]:
        return {
            "voice": {
                "type": "select",
                "label": "Voice",
                "description": "Select Edge TTS voice",
                "default": "zh-CN-XiaoxiaoNeural",
                "required": True,
                "options": cls.COMMON_VOICES,
                "level": "voice",
            },
            "rate": {
                "type": "select",
                "label": "Rate",
                "description": "Speech speed",
                "default": "0%",
                "required": True,
                "options": cls.RATE_OPTIONS,
                "level": "voice",
            },
            "volume": {
                "type": "select",
                "label": "Volume",
                "description": "Output volume",
                "default": "0%",
                "required": True,
                "options": cls.VOLUME_OPTIONS,
                "level": "voice",
            },
            "pitch": {
                "type": "select",
                "label": "Pitch",
                "description": "Output pitch",
                "default": "0Hz",
                "required": True,
                "options": cls.PITCH_OPTIONS,
                "level": "voice",
            },
        }

    def __init__(self, config: dict):
        self.voice = config.get("voice", "zh-CN-XiaoxiaoNeural")
        self.rate = str(config.get("rate", "0%"))
        self.volume = str(config.get("volume", "0%"))
        self.pitch = str(config.get("pitch", "0Hz"))
        self.sample_rate = 24000

    def _communicate(self, text: str) -> edge_tts.Communicate:
        return edge_tts.Communicate(
            text=text,
            voice=self.voice,
            rate=self.rate,
            volume=self.volume,
            pitch=self.pitch,
        )

    async def synthesize_async(self, text: str, language: Optional[str] = None) -> bytes:
        communicate = self._communicate(text)
        buffer = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk.get("type") == "audio":
                buffer.write(chunk["data"])

        audio_bytes = buffer.getvalue()
        if not audio_bytes:
            raise RuntimeError("Edge TTS did not return audio data")
        return audio_bytes

    async def synthesize_stream(
        self,
        text: str,
        language: Optional[str] = None,
        media_type: str = "mp3",
    ) -> AsyncGenerator[bytes, None]:
        communicate = self._communicate(text)
        async for chunk in communicate.stream():
            if chunk.get("type") == "audio":
                yield chunk["data"]

    def supports_streaming(self) -> bool:
        return True

    def get_audio_mime_type(self) -> str:
        return "audio/mpeg"

    async def test_connection(self) -> Dict[str, Any]:
        try:
            audio_bytes = await self.synthesize_async("connection test")
            return {
                "success": True,
                "message": f"Edge TTS connection successful, generated {len(audio_bytes)} bytes",
            }
        except Exception as e:
            logger.error(f"Edge TTS test failed: {e}")
            return {"success": False, "message": f"Edge TTS test failed: {e}"}
