package com.lastpy;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import java.io.File;

import com.facebook.react.bridge.*;

public class FireModelModule extends ReactContextBaseJavaModule {

    private TFLiteHelper model;

    public FireModelModule(ReactApplicationContext context) {
        super(context);
        try {
            model = new TFLiteHelper(context);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return "FireModel";
    }

    @ReactMethod
    public void detect(String imageUri, Promise promise) {
        try {
            // ===== file:// prefix temizle =====
            String filePath = imageUri;
            if (filePath.startsWith("file://")) {
                filePath = filePath.substring(7);
            }

            File imageFile = new File(filePath);
            if (!imageFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Dosya bulunamadı: " + filePath);
                return;
            }

            Bitmap bitmap = BitmapFactory.decodeFile(filePath);
            if (bitmap == null) {
                promise.reject("DECODE_ERROR", "Bitmap decode edilemedi");
                return;
            }

            // ===== MODELI ÇALIŞTIR =====
            DetectionResult result = model.runWithBox(bitmap);

            // ===== JS TARAFINA MAP DÖN =====
            WritableMap response = Arguments.createMap();
            response.putBoolean("flame", result.flame);

            if (result.box != null) {
                WritableMap box = Arguments.createMap();
                box.putDouble("x1", result.box.x1);
                box.putDouble("y1", result.box.y1);
                box.putDouble("x2", result.box.x2);
                box.putDouble("y2", result.box.y2);
                box.putDouble("conf", result.box.conf);
                response.putMap("box", box);
            }

            promise.resolve(response);

        } catch (Exception e) {
            promise.reject("ERR", e.getMessage(), e);
        }
    }
}
