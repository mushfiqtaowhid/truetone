#import <UIKit/UIKit.h>

%hook CBAdaptationClient
- (BOOL)supported { return YES; }
- (BOOL)isAvailable { return YES; }
- (BOOL)adaptationSupported { return YES; }
- (BOOL)colorAdaptationAvailable { return YES; }
- (BOOL)isColorAdaptationAvailable { return YES; }
- (BOOL)getEnabled { return YES; }
- (BOOL)setEnabled:(BOOL)arg1 { return %orig; }
%end

%hook CBClient
- (BOOL)isColorAdaptationAvailable { return YES; }
- (BOOL)isColorAdaptationModeSupported:(NSInteger)arg1 { return YES; }
%end

%hook CCUIContinuousSliderView
- (BOOL)providesTrueTone { return YES; }
- (BOOL)isTrueToneAvailable { return YES; }
- (BOOL)isTrueToneEnabled { return YES; }
%end

%hook CCUIExpandedModuleContinuousSliderProvider
- (BOOL)providesTrueTone { return YES; }
- (BOOL)isTrueToneAvailable { return YES; }
- (BOOL)isTrueToneEnabled { return YES; }
%end

%hook DisplayAndBrightnessSettingsController
- (BOOL)isTrueToneSupported { return YES; }
- (BOOL)isTrueToneAvailable { return YES; }
%end

%ctor {
    %init;
}
