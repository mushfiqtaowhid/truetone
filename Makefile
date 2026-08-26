TARGET := iphone:clang:16.5:15.0
ARCHS := arm64 arm64e
THEOS_PACKAGE_SCHEME := rootless

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = FakeTrueTone

FakeTrueTone_FILES = Tweak.x
FakeTrueTone_CFLAGS = -fobjc-arc -Wno-deprecated-declarations -Wno-unused-variable
FakeTrueTone_PRIVATE_FRAMEWORKS = CoreBrightness Preferences ControlCenterUI
FakeTrueTone_FRAMEWORKS = UIKit Foundation

include $(THEOS_MAKE_PATH)/tweak.mk

after-install::
	install.exec "sbreload"
