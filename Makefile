# ==============================================================================
# Makefile - FakeTrueTone Rootless Jailbreak Tweak
# Target: iOS 15.0 - 16.7.x (Dopamine / Palera1n Rootless)
# Package Manager: Sileo / Zebra / Cydia (Debian Standard)
# ==============================================================================

# Enable modern rootless packaging scheme (Places binaries in /var/jb)
THEOS_PACKAGE_SCHEME = rootless

# Target modern 64-bit iOS devices (A11 - A16 / M1 - M2)
ARCHS = arm64 arm64e
TARGET = iphone:clang:latest:15.0
INSTALL_TARGET_PROCESSES = SpringBoard Preferences

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = FakeTrueTone

FakeTrueTone_FILES = Tweak.x
FakeTrueTone_CFLAGS = -fobjc-arc -Wno-unused-variable -Wno-deprecated-declarations
FakeTrueTone_FRAMEWORKS = UIKit Foundation
FakeTrueTone_PRIVATE_FRAMEWORKS = Preferences CoreBrightness ControlCenterUI

include $(THEOS_MAKE_PATH)/tweak.mk

after-install::
	install.exec "killall -9 SpringBoard Preferences"
