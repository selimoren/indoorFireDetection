package com.lastpy;

public class DetectionResult {
    public boolean flame;
    public DetectionBox box;

    public DetectionResult(boolean flame, DetectionBox box) {
        this.flame = flame;
        this.box = box;
    }
}
