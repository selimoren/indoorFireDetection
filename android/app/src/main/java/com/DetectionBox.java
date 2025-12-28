package com.lastpy;

public class DetectionBox {
    public float x1, y1, x2, y2, conf;

    public DetectionBox(float x1, float y1, float x2, float y2, float conf) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.conf = conf;
    }
}
