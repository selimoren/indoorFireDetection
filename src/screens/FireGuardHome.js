import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";

export default function FireGuardHome({ navigation }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Firebase'i başlat ve token kaydet
    (async () => {
      try {
        await initializeFirebase();
        setIsInitialized(true);
      } catch (error) {
        console.error("Firebase initialization error:", error);
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>FireGuard</Text>
          <Text style={styles.subtitle}>Kapalı Alan Güvenliği</Text>
        </View>

        <View style={styles.headerIcons}>
          <Icon name="notifications" />
          <Icon name="info" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={["#137fec", "#2563eb"]}
            style={styles.hero}
          >
            <MaterialIcons name="shield" size={26} color="#fff" />
            <Text style={styles.heroTitle}>
              Kapalı Alanlarda{"\n"}Güvende Kalın
            </Text>
            <Text style={styles.heroDesc}>
              Yangın risklerini tanıyın, havalandırmayı kontrol edin ve kaçış
              yollarını öğrenin.
            </Text>

            <TouchableOpacity style={styles.heroBtn}>
              <MaterialIcons name="menu-book" size={18} color="#137fec" />
              <Text style={styles.heroBtnText}>Güvenlik Rehberi</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* CATEGORIES */}
        <HorizontalSection
          title="Hızlı Erişim"
          items={[
            { label: "Uyarılar", img: IMG.alarm },
            { label: "Müdahale", img: IMG.firstAid },
            { label: "Tahliye", img: IMG.exit },
            { label: "Ekipman", img: IMG.firefighter },
          ]}
        />

        {/* RISK CARDS */}
        <SectionTitle
          title="Kapalı Alan Riskleri"
          subtitle="İç mekanlarda sık karşılaşılan yangın kaynakları."
        />

        <HorizontalCards
          cards={[
            {
              tag: "MOBİLYA",
              color: "#dc2626",
              title: "Katı Maddeler",
              desc: "Perdeler, halılar ve ahşap mobilyalar hızlı tutuşur.",
              img: IMG.wood,
            },
            {
              tag: "KİMYASAL",
              color: "#ea580c",
              title: "Sıvı Maddeler",
              desc: "Temizlik ürünleri ve çözücüler risklidir.",
              img: IMG.liquid,
            },
            {
              tag: "TESİSAT",
              color: "#2563eb",
              title: "Gaz Kaçakları",
              desc: "Ocak ve kombiler düzenli kontrol edilmelidir.",
              img: IMG.gas,
            },
          ]}
        />

        {/* CHECKLIST */}
        <SectionTitle
          title="Hayati Kontroller"
          subtitle="Kapalı alan güvenliği için olmazsa olmazlar."
        />

        <ChecklistItem
          icon="air"
          color="#137fec"
          title="Havalandırma"
          desc="Menfezlerin açık ve temiz olduğunu doğrulayın."
        />

        <ChecklistItem
          icon="emergency-home"
          color="#16a34a"
          title="Kaçış Yolları"
          desc="Acil çıkış kapıları kapalı olmamalıdır."
        />

        <ChecklistItem
          icon="fire-extinguisher"
          color="#dc2626"
          title="Yangın Tüpleri"
          desc="Basınç ve son kullanma tarihi kontrol edilmeli."
        />
      </ScrollView>

      {/* FIXED CAMERA BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => navigation?.navigate("Camera")}
        >
          <MaterialIcons name="photo-camera" size={22} color="#fff" />
          <Text style={styles.cameraText}>Kameraya Git</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Icon = ({ name }) => (
  <TouchableOpacity style={styles.iconBtn}>
    <MaterialIcons name={name} size={22} color="#fff" />
  </TouchableOpacity>
);

const SectionTitle = ({ title, subtitle }) => (
  <View style={styles.sectionTitle}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <Text style={styles.sectionSub}>{subtitle}</Text>
  </View>
);

const HorizontalSection = ({ items }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
    {items.map((i, idx) => (
      <View key={idx} style={styles.circleItem}>
        <ImageBackground source={{ uri: i.img }} style={styles.circleImg} />
        <Text style={styles.circleLabel}>{i.label}</Text>
      </View>
    ))}
  </ScrollView>
);

const HorizontalCards = ({ cards }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
    {cards.map((c, idx) => (
      <View key={idx} style={styles.card}>
        <ImageBackground source={{ uri: c.img }} style={styles.cardImg}>
          <Text style={[styles.tag, { backgroundColor: c.color }]}>{c.tag}</Text>
        </ImageBackground>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.cardDesc}>{c.desc}</Text>
        </View>
      </View>
    ))}
  </ScrollView>
);

const ChecklistItem = ({ icon, color, title, desc }) => (
  <View style={styles.checkItem}>
    <View style={[styles.checkIcon, { backgroundColor: `${color}20` }]}>
      <MaterialIcons name={icon} size={28} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.checkTitle}>{title}</Text>
      <Text style={styles.checkDesc}>{desc}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
  </View>
);

/* ---------------- IMAGES ---------------- */

const IMG = {
  alarm: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144",
  firstAid: "https://images.unsplash.com/photo-1580281657521-6a50c2f26b9d",
  exit: "https://images.unsplash.com/photo-1603791452906-5cfd74f2f7d8",
  firefighter: "https://images.unsplash.com/photo-1604537466573-5e94508fd243",
  wood: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  liquid: "https://images.unsplash.com/photo-1581091215367-59ab6b51c6c1",
  gas: "https://images.unsplash.com/photo-1581091870627-3baf4c3c1a60",
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101922" },

  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { color: "#137fec", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#9ca3af", fontSize: 12 },

  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#1f2933",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  heroWrapper: { padding: 16 },
  hero: { borderRadius: 20, padding: 20 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 10 },
  heroDesc: { color: "#dbeafe", fontSize: 14, marginVertical: 12 },
  heroBtn: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  heroBtnText: { color: "#137fec", fontWeight: "700" },

  sectionTitle: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { color: "#fff", fontSize: 22, fontWeight: "700" },
  sectionSub: { color: "#9ca3af", fontSize: 14, marginTop: 4 },

  hScroll: { paddingLeft: 16, marginTop: 12 },

  circleItem: { alignItems: "center", marginRight: 16 },
  circleImg: { width: 72, height: 72, borderRadius: 36 },
  circleLabel: { color: "#fff", fontSize: 12, marginTop: 6 },

  card: {
    width: 260,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
  },
  cardImg: { height: 140 },
  tag: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    padding: 6,
    margin: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cardBody: { padding: 12 },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardDesc: { color: "#9ca3af", fontSize: 14, marginTop: 4 },

  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#111827",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  checkIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  checkDesc: { color: "#9ca3af", fontSize: 12 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#101922dd",
  },
  cameraBtn: {
    backgroundColor: "#137fec",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  cameraText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
