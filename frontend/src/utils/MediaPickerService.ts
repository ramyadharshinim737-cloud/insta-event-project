import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface MediaResult {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
}

export class MediaPickerService {
  // Request permissions
  static async requestPermissions(): Promise<boolean> {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to use this feature.'
      );
      return false;
    }
    return true;
  }

  // Pick image from gallery
  static async pickImage(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  }

  // Pick video from gallery
  static async pickVideo(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'video',
          width: result.assets[0].width,
          height: result.assets[0].height,
          duration: result.assets[0].duration,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
      return null;
    }
  }

  // Take photo with camera
  static async takePhoto(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }

  // Record video with camera
  static async recordVideo(): Promise<MediaResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'video',
          width: result.assets[0].width,
          height: result.assets[0].height,
          duration: result.assets[0].duration,
        };
      }
      return null;
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
      return null;
    }
  }

  // Show media options menu
  static showMediaOptions(
    onPickImage: () => void,
    onTakePhoto: () => void,
    onPickVideo?: () => void,
    onRecordVideo?: () => void
  ) {
    const options = [
      { text: 'Choose from Gallery', onPress: onPickImage },
      { text: 'Take Photo', onPress: onTakePhoto },
    ];

    if (onPickVideo) {
      options.push({ text: 'Choose Video', onPress: onPickVideo });
    }

    if (onRecordVideo) {
      options.push({ text: 'Record Video', onPress: onRecordVideo });
    }

    options.push({ text: 'Cancel', style: 'cancel' as const });

    Alert.alert('Add Media', 'Choose an option', options);
  }
}
