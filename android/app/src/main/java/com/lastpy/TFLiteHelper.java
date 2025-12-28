package com.lastpy;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.Color;

import org.tensorflow.lite.Interpreter;

import java.io.FileInputStream;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayDeque;

public class TFLiteHelper {

    private Interpreter interpreter;

    private static final int INPUT_SIZE = 640;
    private static final float CONF_THRESHOLD = 0.6f;

    private static final int TEMP_WINDOW = 3;
    private static final int MIN_POSITIVE = 2;

    private final ArrayDeque<Boolean> flameHistory = new ArrayDeque<>();

    // ===== MODEL LOADER (GÜVENLİ) =====
    private MappedByteBuffer loadModel(Context context) throws Exception {
        AssetFileDescriptor fileDescriptor =
                context.getAssets().openFd("best_float16.tflite");

        FileInputStream inputStream =
                new FileInputStream(fileDescriptor.getFileDescriptor());

        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();

        MappedByteBuffer model = fileChannel.map(
                FileChannel.MapMode.READ_ONLY,
                startOffset,
                declaredLength
        );

        inputStream.close();
        fileDescriptor.close();

        return model;
    }

    // ===== CONSTRUCTOR =====
    public TFLiteHelper(Context context) throws Exception {
        Interpreter.Options options = new Interpreter.Options();
        options.setNumThreads(4); // 🔥 performans
        interpreter = new Interpreter(loadModel(context), options);
    }

    // ===== PREPROCESS =====
    private float[][][][] preprocess(Bitmap bitmap) {
        Bitmap resized =
                Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true);

        float[][][][] input = new float[1][INPUT_SIZE][INPUT_SIZE][3];

        for (int y = 0; y < INPUT_SIZE; y++) {
            for (int x = 0; x < INPUT_SIZE; x++) {
                int pixel = resized.getPixel(x, y);
                input[0][y][x][0] = Color.red(pixel) / 255f;
                input[0][y][x][1] = Color.green(pixel) / 255f;
                input[0][y][x][2] = Color.blue(pixel) / 255f;
            }
        }
        return input;
    }

    // ===== MAIN RUN (BOX + FLAME) =====
    public DetectionResult runWithBox(Bitmap bitmap) {

        float[][][][] input = preprocess(bitmap);
        float[][][] output = new float[1][5][8400];

        interpreter.run(input, output);

        boolean frameFlame = false;
        int bestIdx = -1;
        float bestConf = 0f;

        for (int i = 0; i < 8400; i++) {
            float conf = output[0][4][i];
            if (conf > CONF_THRESHOLD) {
                frameFlame = true;
                if (conf > bestConf) {
                    bestConf = conf;
                    bestIdx = i;
                }
            }
        }

        // ===== TEMPORAL FILTER =====
        flameHistory.addLast(frameFlame);
        if (flameHistory.size() > TEMP_WINDOW) {
            flameHistory.removeFirst();
        }

        int count = 0;
        for (boolean f : flameHistory) {
            if (f) count++;
        }

        boolean flameDetected = count >= MIN_POSITIVE;

        // ===== BOX HESABI =====
        DetectionBox box = null;

        if (bestIdx != -1) {
            float cx = output[0][0][bestIdx] * INPUT_SIZE;
            float cy = output[0][1][bestIdx] * INPUT_SIZE;
            float w  = output[0][2][bestIdx] * INPUT_SIZE;
            float h  = output[0][3][bestIdx] * INPUT_SIZE;

            box = new DetectionBox(
                    cx - w / 2f,
                    cy - h / 2f,
                    cx + w / 2f,
                    cy + h / 2f,
                    bestConf
            );
        }

        return new DetectionResult(flameDetected, box);
    }
}
