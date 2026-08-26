import { TweakFile } from '../types';

export const TWEAK_PROJECT_FILES: TweakFile[] = [
  {
    name: 'Makefile',
    path: 'Makefile',
    language: 'makefile',
    description: 'Rootless Theos build definition for arm64/arm64e targeting iOS 15.0–16.7.x',
    content: `# ==============================================================================
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
`
  },
  {
    name: 'control',
    path: 'control',
    language: 'debian',
    description: 'Debian control packaging metadata configured for Sileo & rootless architecture',
    content: `Package: com.developer.faketruetone
Name: FakeTrueTone (Rootless)
Version: 1.0.0
Architecture: iphoneos-arm64
Description: Enables dummy True Tone toggle in Settings & Control Center on iOS 15-16 rootless jailbreaks.
Maintainer: iOS Tweak Developer <dev@iosjb.internal>
Author: iOS Tweak Developer
Section: Tweaks
Depends: mobilesubstrate (>= 0.9.7000), firmware (>= 15.0)
Tag: role::developer, compatible::ios15, compatible::ios16
Depiction: https://repo.example.com/depiction/faketruetone
Icon: https://repo.example.com/icons/faketruetone.png
`
  },
  {
    name: 'Tweak.x',
    path: 'Tweak.x',
    language: 'objective-c',
    description: 'Logos hooks for CoreBrightness, Preferences (Display & Brightness), and Control Center UI',
    content: `// ==============================================================================
// FakeTrueTone - Tweak.x
// High-compatibility dummy True Tone toggle for iOS 15.0 - 16.7.x (Rootless)
// Hooks: CoreBrightness, Preferences.framework, and ControlCenterUI
// ==============================================================================

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <notify.h>
#import "Headers.h"

#define PREF_DOMAIN @"com.developer.faketruetone"
#define PREF_KEY_TRUETONE @"kFakeTrueToneEnabled"
#define NOTIFY_CHANGED "com.developer.faketruetone.changed"

static BOOL g_fakeTrueToneEnabled = YES;

// Safe Rootless Preference Loader using CFPreferences to bypass daemon sandbox restrictions
static void loadPreferences() {
    CFArrayRef keyList = CFPreferencesCopyKeyList((CFStringRef)PREF_DOMAIN, kCFPreferencesCurrentUser, kCFPreferencesAnyHost);
    if (keyList) {
        CFDictionaryRef prefs = CFPreferencesCopyMultiple(keyList, (CFStringRef)PREF_DOMAIN, kCFPreferencesCurrentUser, kCFPreferencesAnyHost);
        if (prefs) {
            NSNumber *val = (__bridge NSNumber *)CFDictionaryGetValue(prefs, (CFStringRef)PREF_KEY_TRUETONE);
            if (val != nil) {
                g_fakeTrueToneEnabled = [val boolValue];
            }
            CFRelease(prefs);
        }
        CFRelease(keyList);
    }
}

static void savePreference(BOOL enabled) {
    g_fakeTrueToneEnabled = enabled;
    CFPreferencesSetAppValue(
        (CFStringRef)PREF_KEY_TRUETONE,
        (__bridge CFPropertyListRef)@(enabled),
        (CFStringRef)PREF_DOMAIN
    );
    CFPreferencesAppSynchronize((CFStringRef)PREF_DOMAIN);
    
    // Broadcast Darwin notification to synchronize across SpringBoard, Preferences, and daemons
    notify_post(NOTIFY_CHANGED);
}

static void NotificationCallback(CFNotificationCenterRef center, void *observer, CFStringRef name, const void *object, CFDictionaryRef userInfo) {
    loadPreferences();
}

#pragma mark - 1. CoreBrightness Hooks (CBAdaptationClient & CBClient)

// Hook the underlying CoreBrightness adaptation engine so iOS reports hardware True Tone support
%hook CBAdaptationClient

// System query for True Tone capability
- (BOOL)supported {
    return YES;
}

- (BOOL)isAvailable {
    return YES;
}

- (BOOL)available {
    return YES;
}

// Return dummy True Tone state without invoking hardware ambient light calibration
- (BOOL)enabled {
    return g_fakeTrueToneEnabled;
}

- (BOOL)getEnabled {
    return g_fakeTrueToneEnabled;
}

- (BOOL)setEnabled:(BOOL)arg1 {
    savePreference(arg1);
    return YES;
}

- (BOOL)colorAdaptationAvailable {
    return YES;
}

- (BOOL)isColorAdaptationAvailable {
    return YES;
}

- (BOOL)colorAdaptationEnabled {
    return g_fakeTrueToneEnabled;
}

- (BOOL)setColorAdaptationEnabled:(BOOL)arg1 {
    savePreference(arg1);
    return YES;
}

%end

// Additional CBClient hook for iOS 16 brightness adaptation subroutines
%hook CBClient

- (BOOL)isColorAdaptationAvailable {
    return YES;
}

- (BOOL)colorAdaptationAvailable {
    return YES;
}

- (id)adaptationClient {
    id orig = %orig;
    return orig;
}

%end

#pragma mark - 2. Preferences App Hooks (Display & Brightness Settings)

// Hook the Display and Brightness PSListController to guarantee the True Tone specifier appears
%hook DisplayAndBrightnessSettingsController

- (id)specifiers {
    NSMutableArray *specs = [%orig mutableCopy];
    
    // Check if True Tone specifier is already present
    BOOL hasTrueToneSpecifier = NO;
    for (PSSpecifier *spec in specs) {
        if ([[spec identifier] isEqualToString:@"TRUE_TONE"] || 
            [[spec identifier] isEqualToString:@"COLOR_ADAPTATION"] ||
            [[spec name] isEqualToString:@"True Tone"]) {
            hasTrueToneSpecifier = YES;
            break;
        }
    }
    
    // If iOS hid the switch due to missing display serial/EEPROM data, inject our dummy PSSpecifier
    if (!hasTrueToneSpecifier && specs) {
        PSSpecifier *trueToneSpec = [PSSpecifier preferenceSpecifierNamed:@"True Tone"
                                                                  target:self
                                                                     set:@selector(setFakeTrueTone:specifier:)
                                                                     get:@selector(getFakeTrueTone:)
                                                                  detail:Nil
                                                                    cell:6 // PSSwitchCell type
                                                                    edit:Nil];
        [trueToneSpec setProperty:@"TRUE_TONE" forKey:@"id"];
        [trueToneSpec setProperty:@(YES) forKey:@"default"];
        [trueToneSpec setProperty:@YES forKey:@"enabled"];
        [trueToneSpec setProperty:@"Automatically adapt iPhone display based on ambient lighting conditions to make colours appear consistent in different environments." 
                           forKey:@"footerText"];
        
        // Find index after Brightness slider or before Night Shift
        NSUInteger insertIndex = NSNotFound;
        for (NSUInteger i = 0; i < specs.count; i++) {
            PSSpecifier *s = specs[i];
            if ([[s identifier] isEqualToString:@"BRIGHTNESS_SLIDER"] ||
                [[s identifier] isEqualToString:@"AUTO_BRIGHTNESS"] ||
                [[s name] isEqualToString:@"Brightness"]) {
                insertIndex = i + 1;
            }
        }
        
        if (insertIndex != NSNotFound && insertIndex <= specs.count) {
            [specs insertObject:trueToneSpec atIndex:insertIndex];
        } else {
            [specs addObject:trueToneSpec];
        }
    }
    
    return specs;
}

%new
- (id)getFakeTrueTone:(PSSpecifier *)specifier {
    loadPreferences();
    return @(g_fakeTrueToneEnabled);
}

%new
- (void)setFakeTrueTone:(id)value specifier:(PSSpecifier *)specifier {
    BOOL enabled = [value boolValue];
    savePreference(enabled);
}

%end

#pragma mark - 3. Control Center Expanded Slider (SpringBoard / CCUI)

// Hook the Expanded Brightness Module in Control Center
%hook CCUIContinuousSliderView

- (BOOL)isTrueToneSupported {
    return YES;
}

- (BOOL)isTrueToneAvailable {
    return YES;
}

%end

// Hook CCUIExpandedModuleContinuousSliderProvider to force the True Tone round button in expanded slider
%hook CCUIExpandedModuleContinuousSliderProvider

- (BOOL)providesTrueTone {
    return YES;
}

- (BOOL)isTrueToneEnabled {
    return g_fakeTrueToneEnabled;
}

- (void)setTrueToneEnabled:(BOOL)enabled {
    savePreference(enabled);
    %orig(enabled);
}

%end

#pragma mark - 4. Tweak Initialization

%ctor {
    @autoreleasepool {
        loadPreferences();
        
        // Register Darwin notification for instant live updates across SpringBoard & Settings
        CFNotificationCenterAddObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            NULL,
            NotificationCallback,
            CFSTR(NOTIFY_CHANGED),
            NULL,
            CFNotificationSuspensionBehaviorCoalesce
        );
        
        NSLog(@"[FakeTrueTone] Rootless tweak loaded successfully on iOS 15/16! State: %d", g_fakeTrueToneEnabled);
    }
}
`
  },
  {
    name: 'FakeTrueTone.plist',
    path: 'FakeTrueTone.plist',
    language: 'xml',
    description: 'Tweak filter plist defining target bundles and system daemons for MobileSubstrate/ElleKit injection',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Filter</key>
    <dict>
        <key>Bundles</key>
        <array>
            <!-- Preferences App (Display & Brightness Settings) -->
            <string>com.apple.Preferences</string>
            <!-- SpringBoard (Control Center UI & System Shell) -->
            <string>com.apple.springboard</string>
            <!-- Control Center Framework -->
            <string>com.apple.ControlCenterUI</string>
            <!-- CoreBrightness Private Daemon & Framework -->
            <string>com.apple.CoreBrightness</string>
        </array>
        <key>Executables</key>
        <array>
            <string>SpringBoard</string>
            <string>Preferences</string>
        </array>
    </dict>
</dict>
</plist>
`
  },
  {
    name: 'Headers.h',
    path: 'Headers.h',
    language: 'objective-c',
    description: 'Private header definitions for Preferences and CoreBrightness frameworks',
    content: `// ==============================================================================
// Headers.h - Private class declarations for Preferences & CoreBrightness
// ==============================================================================

#import <UIKit/UIKit.h>

@interface PSSpecifier : NSObject
+ (instancetype)preferenceSpecifierNamed:(NSString *)title
                                  target:(id)target
                                     set:(SEL)set
                                     get:(SEL)get
                                  detail:(Class)detail
                                    cell:(NSInteger)cell
                                    edit:(Class)edit;
- (void)setProperty:(id)property forKey:(NSString *)key;
- (id)propertyForKey:(NSString *)key;
- (NSString *)identifier;
- (NSString *)name;
@end

@interface PSListController : UIViewController
- (id)specifiers;
- (PSSpecifier *)specifierForID:(NSString *)identifier;
- (void)reloadSpecifiers;
@end

@interface DisplayAndBrightnessSettingsController : PSListController
- (id)getFakeTrueTone:(PSSpecifier *)specifier;
- (void)setFakeTrueTone:(id)value specifier:(PSSpecifier *)specifier;
@end

@interface CBAdaptationClient : NSObject
- (BOOL)supported;
- (BOOL)isAvailable;
- (BOOL)available;
- (BOOL)enabled;
- (BOOL)getEnabled;
- (BOOL)setEnabled:(BOOL)arg1;
- (BOOL)colorAdaptationAvailable;
- (BOOL)isColorAdaptationAvailable;
- (BOOL)colorAdaptationEnabled;
- (BOOL)setColorAdaptationEnabled:(BOOL)arg1;
@end

@interface CBClient : NSObject
- (BOOL)isColorAdaptationAvailable;
- (BOOL)colorAdaptationAvailable;
- (id)adaptationClient;
@end

@interface CCUIContinuousSliderView : UIView
- (BOOL)isTrueToneSupported;
- (BOOL)isTrueToneAvailable;
@end

@interface CCUIExpandedModuleContinuousSliderProvider : NSObject
- (BOOL)providesTrueTone;
- (BOOL)isTrueToneEnabled;
- (void)setTrueToneEnabled:(BOOL)enabled;
@end
`
  },
  {
    name: 'build.sh',
    path: 'build.sh',
    language: 'shell',
    description: 'Rootless Theos build and deployment helper script for Dopamine jailbreak',
    content: `#!/usr/bin/env bash
# ==============================================================================
# FakeTrueTone Rootless Compilation & Packaging Script
# Requires: Theos toolchain with iOS 15/16 SDK & rootless support
# ==============================================================================

set -e

echo "[*] Setting up Rootless Theos Environment..."
export THEOS_PACKAGE_SCHEME=rootless
export ARCHS="arm64 arm64e"
export TARGET="iphone:clang:latest:15.0"

# Check if Theos directory exists
if [ -z "$THEOS" ]; then
    export THEOS=~/theos
fi

if [ ! -d "$THEOS" ]; then
    echo "[!] Error: Theos is not found at $THEOS."
    echo "    Please install Theos: bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/theos/theos/master/bin/install-theos)\""
    exit 1
fi

echo "[*] Cleaning old build artifacts..."
make clean

echo "[*] Compiling FakeTrueTone (FINALPACKAGE=1 for optimized release)..."
make package FINALPACKAGE=1

echo "======================================================================"
echo "[+] SUCCESS: .deb package generated in packages/ directory!"
echo "[+] Architecture: iphoneos-arm64 (Dopamine / Palera1n Rootless /var/jb)"
echo "[+] Transfer to device via Sileo, Filza, or SSH:"
echo "    scp packages/*.deb root@<IP>:/var/jb/var/mobile/Downloads/"
echo "======================================================================"
`
  },
  {
    name: 'DEBIAN/postinst',
    path: 'layout/DEBIAN/postinst',
    language: 'shell',
    description: 'Post-installation maintainer script to respring and restart Preferences cleanly',
    content: `#!/usr/bin/env bash
# Rootless maintainer script for FakeTrueTone

# Respring SpringBoard and kill Preferences app to load tweak bundle immediately
if [ -x "/var/jb/usr/bin/sbreload" ]; then
    /var/jb/usr/bin/sbreload
elif [ -x "/var/jb/usr/bin/killall" ]; then
    /var/jb/usr/bin/killall -9 SpringBoard Preferences 2>/dev/null || true
else
    killall -9 SpringBoard Preferences 2>/dev/null || true
fi

exit 0
`
  }
];

export const CLI_COMMANDS = [
  {
    title: '1. Export Rootless Scheme',
    cmd: 'export THEOS_PACKAGE_SCHEME=rootless',
    desc: 'Tells Theos to generate rootless payloads targeting /var/jb'
  },
  {
    title: '2. Clean Old Builds',
    cmd: 'make clean',
    desc: 'Removes cached object files and stale bundle binaries'
  },
  {
    title: '3. Build & Package Release Deb',
    cmd: 'make package FINALPACKAGE=1',
    desc: 'Compiles with clang for arm64/arm64e, strips debug symbols, and generates .deb'
  },
  {
    title: '4. Direct Install Over SSH (Optional)',
    cmd: 'make do THEOS_DEVICE_IP=192.168.1.50 THEOS_DEVICE_PORT=22',
    desc: 'Automatically uploads and installs package to jailbroken device over Wi-Fi'
  }
];
