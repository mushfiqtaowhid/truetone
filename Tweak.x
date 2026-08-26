// ==============================================================================
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
