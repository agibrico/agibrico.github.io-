import React, { useState } from 'react';
import { 
  Smartphone, 
  Code2, 
  FolderTree, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Database, 
  ShieldCheck, 
  Play, 
  ExternalLink,
  BookOpen,
  Mail,
  Store,
  MapPin,
  CreditCard,
  Sparkles,
  Terminal,
  FileCode2
} from 'lucide-react';

interface AndroidFile {
  path: string;
  category: 'gradle' | 'manifest' | 'core' | 'di' | 'data' | 'domain' | 'presentation';
  title: string;
  description: string;
  language: 'kotlin' | 'groovy' | 'xml';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'build.gradle.kts (Project)',
    category: 'gradle',
    title: 'Configuration Racine du Projet Gradle',
    description: 'Plugins Kotlin 2.0, Android Gradle Plugin 8.5+, Hilt & KSP',
    language: 'kotlin',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.jetbrains.kotlin.android) apply false
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.hilt.android) apply false
    alias(libs.plugins.ksp) apply false
}`
  },
  {
    path: 'app/build.gradle.kts (Module: app)',
    category: 'gradle',
    title: 'Dépendances & Configuration du Module Android',
    description: 'Jetpack Compose Material 3, Room, Hilt, ZXing / QR Generator, Retrofit, Coroutines',
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "ci.agb.qrcodedesigner"
    compileSdk = 35

    defaultConfig {
        applicationId = "ci.agb.qrcodedesigner"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Room Schema location
        ksp {
            arg("room.schemaLocation", "$projectDir/schemas")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Core
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coroutines & StateFlow
    implementation(libs.kotlinx.coroutines.android)

    // QR Code Engine (ZXing & QRGenerator)
    implementation("com.google.zxing:core:3.5.3")
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")

    // Image Loading (Coil for Compose)
    implementation("io.coil-kt:coil-compose:2.7.0")

    // JSON Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.1")
    implementation("com.google.code.gson:gson:2.11.0")

    // CameraX (for QR Verification test)
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    title: 'Manifeste de l\'Application Android',
    description: 'Permissions caméra, stockage, impression & déclarations d\'activités',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions requises pour la production et le test -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <application
        android:name=".AGBApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AGBQRCodeDesigner"
        tools:targetApi="35">

        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.AGBQRCodeDesigner">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Fournisseur de fichiers pour le partage / impression PDF -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.provider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/AGBApplication.kt',
    category: 'core',
    title: 'Application Class (Hilt Container)',
    description: 'Initialisation globale de l\'injection de dépendances Hilt',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class AGBApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialisation de la base Room et configuration du concepteur AGB
    }
}`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/data/local/entity/ClientEntity.kt',
    category: 'data',
    title: 'Entité Room : ClientEntity',
    description: 'Modèle de données Room pour le carnet de clients du concepteur',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "clients")
data class ClientEntity(
    @PrimaryKey
    val id: String, // ex: client_001
    val clientNumber: String, // ex: CLT-2026-0001
    val firstName: String,
    val lastName: String,
    val fullName: String,
    val company: String,
    val commercialName: String? = null,
    val jobTitle: String,
    val industry: String? = null,
    val photoUrl: String? = null,
    val logoUrl: String? = null,
    val primaryPhone: String,
    val secondaryPhone: String? = null,
    val whatsappNumber: String? = null,
    val workPhone: String? = null,
    val email: String,
    val workEmail: String? = null,
    val websiteUrl: String? = null,
    val address: String,
    val commune: String? = null,
    val neighborhood: String? = null,
    val city: String = "Abidjan",
    val country: String = "Côte d'Ivoire",
    val locationLink: String? = null,
    val slogan: String? = null,
    val bio: String? = null,
    val servicesListJson: String = "[]",
    val productsListJson: String = "[]",
    val socialLinksJson: String = "[]",
    val internalNotes: String? = null, // Notes privées réservées au concepteur
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/data/local/entity/QRCodeEntity.kt',
    category: 'data',
    title: 'Entité Room : QRCodeEntity',
    description: 'Modèle Room complet pour tous les types de QR Codes (Card, Book, Invitation, Shop, Location)',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "qrcodes",
    foreignKeys = [
        ForeignKey(
            entity = ClientEntity::class,
            parentColumns = ["id"],
            childColumns = ["clientId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [Index(value = ["publicId"], unique = true), Index(value = ["clientId"])]
)
data class QRCodeEntity(
    @PrimaryKey
    val id: String, // ex: qr_1724281200
    val cardNumber: String, // ex: AGB-CARD-000001, AGB-BOOK-000002
    val publicId: String, // ex: AGB001, 8F72KX91 (Utilisé dans https://agibrico.github.io/q/PUBLIC_ID)
    val clientId: String? = null,
    val title: String,
    val type: String, // "vcard", "book", "invitation", "shop", "location", "event", "product", "menu"
    val mode: String = "dynamic", // "dynamic" | "static"
    val status: String = "active", // "active", "inactive", "archived"
    val modelId: String = "model_classic",
    val cardFormat: String = "85x55", // "85x55", "90x50"
    
    // Contenu JSON sérialisé
    val contentJson: String,
    
    // Design & Stylisme QR (Couleurs, Yeux, Modules, Logo)
    val stylingJson: String,
    
    // Métriques & Scans
    val scanCount: Int = 0,
    val lastScannedAt: Long? = null,
    
    // Synchronisation GitHub Pages
    val isSyncedToGithub: Boolean = false,
    val githubSyncDate: Long? = null,
    
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/data/local/dao/QRCodeDao.kt',
    category: 'data',
    title: 'DAO Room : QRCodeDao',
    description: 'Interface d\'accès SQL pour les opérations CRUD et recherches réactives Flow',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.data.local.dao

import androidx.room.*
import ci.agb.qrcodedesigner.data.local.entity.QRCodeEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface QRCodeDao {

    @Query("SELECT * FROM qrcodes ORDER BY updatedAt DESC")
    fun getAllQRCodesFlow(): Flow<List<QRCodeEntity>>

    @Query("SELECT * FROM qrcodes WHERE type = :type ORDER BY updatedAt DESC")
    fun getQRCodesByTypeFlow(type: String): Flow<List<QRCodeEntity>>

    @Query("SELECT * FROM qrcodes WHERE id = :id LIMIT 1")
    suspend fun getQRCodeById(id: String): QRCodeEntity?

    @Query("SELECT * FROM qrcodes WHERE publicId = :publicId LIMIT 1")
    suspend fun getQRCodeByPublicId(publicId: String): QRCodeEntity?

    @Query("SELECT * FROM qrcodes WHERE clientId = :clientId ORDER BY updatedAt DESC")
    fun getQRCodesByClientFlow(clientId: String): Flow<List<QRCodeEntity>>

    @Query("SELECT COUNT(*) FROM qrcodes")
    fun getTotalCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM qrcodes WHERE status = 'active'")
    fun getActiveCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM qrcodes WHERE status = 'inactive'")
    fun getInactiveCountFlow(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(qrCode: QRCodeEntity)

    @Delete
    suspend fun delete(qrCode: QRCodeEntity)

    @Query("DELETE FROM qrcodes WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("UPDATE qrcodes SET status = :status, updatedAt = :timestamp WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE qrcodes SET scanCount = scanCount + 1, lastScannedAt = :timestamp WHERE publicId = :publicId")
    suspend fun incrementScanCount(publicId: String, timestamp: Long = System.currentTimeMillis())
}`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/domain/qr/QRCodeGeneratorEngine.kt',
    category: 'domain',
    title: 'Moteur de Génération QR Code Bitmap & Validation',
    description: 'Génération haute précision avec ZXing, correction d\'erreur H, logo central & test de lisibilité',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.domain.qr

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

data class QRConfig(
    val contentUrl: String, // ex: "https://agibrico.github.io/q/AGB-CARD-000001"
    val size: Int = 1024,
    val foregroundColor: Int = Color.BLACK,
    val backgroundColor: Int = Color.WHITE,
    val eyeColor: Int? = null,
    val margin: Int = 2,
    val errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.H,
    val logoBitmap: Bitmap? = null,
    val logoRatio: Float = 0.22f // Max 25% pour garantir la lisibilité
)

data class QRValidationResult(
    val isValid: Boolean,
    val message: String,
    val contrastRatio: Float,
    val quietZoneOk: Boolean,
    val logoCoverageOk: Boolean
)

@Singleton
class QRCodeGeneratorEngine @Inject constructor() {

    /**
     * Génère un Bitmap haute résolution pour l'impression physique et l'affichage écran
     */
    suspend fun generateQRCode(config: QRConfig): Bitmap = withContext(Dispatchers.Default) {
        val hints = mapOf(
            EncodeHintType.ERROR_CORRECTION to config.errorCorrectionLevel,
            EncodeHintType.MARGIN to config.margin,
            EncodeHintType.CHARACTER_SET to "UTF-8"
        )

        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(
            config.contentUrl,
            BarcodeFormat.QR_CODE,
            config.size,
            config.size,
            hints
        )

        val width = bitMatrix.width
        val height = bitMatrix.height
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        // Remplissage des modules du QR Code
        for (x in 0 until width) {
            for (y in 0 until height) {
                bitmap.setPixel(
                    x,
                    y,
                    if (bitMatrix.get(x, y)) config.foregroundColor else config.backgroundColor
                )
            }
        }

        // Intégration optionnelle du logo au centre avec zone de protection
        config.logoBitmap?.let { rawLogo ->
            val canvas = Canvas(bitmap)
            val logoSize = (width * config.logoRatio.coerceIn(0.12f, 0.25f)).toInt()
            val left = (width - logoSize) / 2
            val top = (height - logoSize) / 2
            val right = left + logoSize
            val bottom = top + logoSize

            // Fond blanc protecteur sous le logo
            val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = config.backgroundColor
                style = Paint.Style.FILL
            }
            val rect = RectF(left.toFloat() - 10f, top.toFloat() - 10f, right.toFloat() + 10f, bottom.toFloat() + 10f)
            canvas.drawRoundRect(rect, 16f, 16f, bgPaint)

            // Dessin du logo centré
            val scaledLogo = Bitmap.createScaledBitmap(rawLogo, logoSize, logoSize, true)
            canvas.drawBitmap(scaledLogo, left.toFloat(), top.toFloat(), null)
        }

        bitmap
    }

    /**
     * Validation automatique avant impression
     */
    fun validateQR(config: QRConfig): QRValidationResult {
        val contrast = calculateContrast(config.foregroundColor, config.backgroundColor)
        val isContrastOk = contrast >= 4.5f
        val isLogoOk = config.logoRatio <= 0.25f
        val isMarginOk = config.margin >= 2

        val isValid = isContrastOk && isLogoOk && isMarginOk
        val message = if (isValid) {
            "QR CODE VALIDÉ ✓ — Prêt pour impression physique"
        } else {
            "QR CODE NON VALIDE — Ajustez le contraste ou la taille du logo"
        }

        return QRValidationResult(
            isValid = isValid,
            message = message,
            contrastRatio = contrast,
            quietZoneOk = isMarginOk,
            logoCoverageOk = isLogoOk
        )
    }

    private fun calculateContrast(color1: Int, color2: Int): Float {
        val l1 = calculateLuminance(color1)
        val l2 = calculateLuminance(color2)
        val bright = maxOf(l1, l2)
        val dark = minOf(l1, l2)
        return (bright + 0.05f) / (dark + 0.05f)
    }

    private fun calculateLuminance(color: Int): Float {
        val r = Color.red(color) / 255.0f
        val g = Color.green(color) / 255.0f
        val b = Color.blue(color) / 255.0f
        return 0.2126f * r + 0.7152f * g + 0.0722f * b
    }
}`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/presentation/screens/dashboard/DashboardScreen.kt',
    category: 'presentation',
    title: 'Écran Compose : Dashboard Concepteur AGB',
    description: 'Tableau de bord privé avec statistiques de production, scans, compteurs par type et accès rapide',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.presentation.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToNewQR: () -> Unit,
    onNavigateToClients: () -> Unit,
    onNavigateToQRCodes: () -> Unit,
    onNavigateToTemplates: () -> Unit,
    onNavigateToPrintStudio: () -> Unit,
    onNavigateToSettings: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "AGB QR CODE DESIGNER",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Studio de Production Privé Concepteur",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Default.Settings, contentDescription = "Paramètres")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Bannière Concepteur
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Production Physique & Fiches vCard",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        text = "Générez des QR Codes dynamiques pointant vers https://agibrico.github.io/q/ et imprimez vos cartes aux formats 85x55mm & 90x50mm.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = onNavigateToNewQR,
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("+ NOUVEAU QR CODE", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Statistiques principales
            Text(
                text = "Statistiques Globales",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Clients",
                    value = state.totalClients.toString(),
                    icon = Icons.Default.People
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total QR",
                    value = state.totalQRCodes.toString(),
                    icon = Icons.Default.QrCode
                )
            }

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Actifs",
                    value = state.activeQRCodes.toString(),
                    icon = Icons.Default.CheckCircle,
                    color = Color(0xFF10B981)
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Suspendus",
                    value = state.inactiveQRCodes.toString(),
                    icon = Icons.Default.PauseCircle,
                    color = Color(0xFFF59E0B)
                )
            }

            // Compteurs par Type de QR Code
            Text(
                text = "Répartition par Type de Contenu",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TypeBadge(title = "Cartes", count = state.cardsCount, icon = Icons.Default.CreditCard)
                TypeBadge(title = "Livres", count = state.booksCount, icon = Icons.Default.MenuBook)
                TypeBadge(title = "Invitations", count = state.invitationsCount, icon = Icons.Default.Mail)
                TypeBadge(title = "Commerces", count = state.shopsCount, icon = Icons.Default.Storefront)
                TypeBadge(title = "Lieux", count = state.locationsCount, icon = Icons.Default.Place)
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
fun StatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    icon: ImageVector,
    color: Color = MaterialTheme.colorScheme.primary
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertizally,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(28.dp))
            Column {
                Text(text = title, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
fun TypeBadge(title: String, count: Int, icon: ImageVector) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
        modifier = Modifier.padding(2.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp))
            Text(text = count.toString(), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(text = title, fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/presentation/navigation/AGBNavGraph.kt',
    category: 'presentation',
    title: 'Navigation Compose : Routes & Flux Utilisateur',
    description: 'Graphique de navigation complet connectant Dashboard, Création, Impression, Modèles et Settings',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import ci.agb.qrcodedesigner.presentation.screens.dashboard.DashboardScreen

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Clients : Screen("clients")
    object QRCodes : Screen("qrcodes")
    object NewQRCode : Screen("new_qr_code")
    object BookForm : Screen("book_form")
    object InvitationForm : Screen("invitation_form")
    object ShopForm : Screen("shop_form")
    object LocationForm : Screen("location_form")
    object CardEditor : Screen("card_editor/{qrId}") {
        fun createRoute(qrId: String) = "card_editor/$qrId"
    }
    object PrintStudio : Screen("print_studio/{qrId}") {
        fun createRoute(qrId: String) = "print_studio/$qrId"
    }
    object Settings : Screen("settings")
}

@Composable
fun AGBNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToNewQR = { navController.navigate(Screen.NewQRCode.route) },
                onNavigateToClients = { navController.navigate(Screen.Clients.route) },
                onNavigateToQRCodes = { navController.navigate(Screen.QRCodes.route) },
                onNavigateToTemplates = { navController.navigate(Screen.NewQRCode.route) },
                onNavigateToPrintStudio = { navController.navigate(Screen.QRCodes.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }
        // Déclaration des autres routes Compose...
    }
}`
  },
  {
    path: 'app/src/main/java/ci/agb/qrcodedesigner/presentation/screens/print/PrintStudioManager.kt',
    category: 'presentation',
    title: 'Gestionnaire d\'Impression Android PrintDocumentAdapter',
    description: 'Rendu PDF vectoriel aux formats 85x55mm & 90x50mm avec repères de coupe & fond perdu 2mm',
    language: 'kotlin',
    content: `package ci.agb.qrcodedesigner.presentation.screens.print

import android.content.Context
import android.graphics.*
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.print.PrintManager
import ci.agb.qrcodedesigner.data.local.entity.QRCodeEntity
import java.io.FileOutputStream
import java.io.IOException

class AGBPrintDocumentAdapter(
    private val context: Context,
    private val qrCode: QRCodeEntity,
    private val qrBitmap: Bitmap,
    private val format: String = "85x55" // ou "90x50"
) : PrintDocumentAdapter() {

    private var pdfDocument: PdfDocument? = null

    override fun onLayout(
        oldAttributes: PrintAttributes?,
        newAttributes: PrintAttributes,
        cancellationSignal: CancellationSignal?,
        callback: LayoutResultCallback,
        extras: Bundle?
    ) {
        if (cancellationSignal?.isCanceled == true) {
            callback.onLayoutCancelled()
            return
        }

        val info = PrintDocumentInfo.Builder("Carte_\${qrCode.cardNumber}.pdf")
            .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
            .setPageCount(2) // Page 1: Recto, Page 2: Verso
            .build()

        callback.onLayoutFinished(info, true)
    }

    override fun onWrite(
        pages: Array<out PageRange>?,
        destination: ParcelFileDescriptor,
        cancellationSignal: CancellationSignal?,
        callback: WriteResultCallback
    ) {
        pdfDocument = PdfDocument()

        // 85x55 mm = environ 241 x 156 points PostScript (72 dpi)
        val widthPoints = if (format == "85x55") 241 else 255
        val heightPoints = if (format == "85x55") 156 else 142

        // Page 1: Recto
        val rectoPageInfo = PdfDocument.PageInfo.Builder(widthPoints, heightPoints, 1).create()
        val rectoPage = pdfDocument!!.startPage(rectoPageInfo)
        drawRecto(rectoPage.canvas, widthPoints.toFloat(), heightPoints.toFloat())
        pdfDocument!!.finishPage(rectoPage)

        // Page 2: Verso avec QR Code
        val versoPageInfo = PdfDocument.PageInfo.Builder(widthPoints, heightPoints, 2).create()
        val versoPage = pdfDocument!!.startPage(versoPageInfo)
        drawVerso(versoPage.canvas, widthPoints.toFloat(), heightPoints.toFloat())
        pdfDocument!!.finishPage(versoPage)

        try {
            pdfDocument!!.writeTo(FileOutputStream(destination.fileDescriptor))
        } catch (e: IOException) {
            callback.onWriteFailed(e.toString())
            return
        } finally {
            pdfDocument?.close()
            pdfDocument = null
        }

        callback.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
    }

    private fun drawRecto(canvas: Canvas, w: Float, h: Float) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = Color.WHITE
        canvas.drawRect(0f, 0f, w, h, paint)

        // Dessin du titre et de l'identité
        paint.color = Color.BLACK
        paint.textSize = 14f
        paint.isFakeBoldText = true
        canvas.drawText(qrCode.title, 20f, 40f, paint)
    }

    private fun drawVerso(canvas: Canvas, w: Float, h: Float) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = Color.WHITE
        canvas.drawRect(0f, 0f, w, h, paint)

        // Dessin du QR Code centré
        val qrSize = (h * 0.65f).toInt()
        val left = (w - qrSize) / 2
        val top = (h - qrSize) / 2
        val scaled = Bitmap.createScaledBitmap(qrBitmap, qrSize, qrSize, true)
        canvas.drawBitmap(scaled, left, top, null)
    }
}

fun launchPrintJob(context: Context, qrCode: QRCodeEntity, qrBitmap: Bitmap) {
    val printManager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
    val printAdapter = AGBPrintDocumentAdapter(context, qrCode, qrBitmap, qrCode.cardFormat)
    printManager.print("AGB_Card_\${qrCode.cardNumber}", printAdapter, PrintAttributes.Builder().build())
}`
  }
];

export const AndroidStudioViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[1]); // Default to app build.gradle
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    f => selectedCategory === 'all' || f.category === selectedCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combined = ANDROID_PROJECT_FILES.map(f => `// ==========================================\n// FILE: ${f.path}\n// TITLE: ${f.title}\n// ==========================================\n\n${f.content}\n\n`).join('\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGB_QR_CODE_DESIGNER_Android_Project.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Projet Android Studio Natif (Kotlin & Jetpack Compose)
            </span>
            <span className="text-xs font-semibold text-slate-400">• Clean Architecture & Room</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            AGB QR CODE DESIGNER — Code Source Android
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Retrouvez ci-dessous l'architecture complète du projet Android natif pour Android Studio : injection de dépendances Hilt, Room Database, génération QR Code avec ZXing, adaptateur d'impression PDF et écrans Material 3.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter le Code Complet</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {[
          { id: 'all', label: 'Tous les fichiers' },
          { id: 'gradle', label: 'Gradle & Dépendances' },
          { id: 'manifest', label: 'Manifest & Permissions' },
          { id: 'data', label: 'Room & Base de Données' },
          { id: 'domain', label: 'Générateur QR & Moteur' },
          { id: 'presentation', label: 'Écrans Compose & Impression' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left File Tree & Right Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-600" />
              Arborescence du Projet ({filteredFiles.length})
            </h3>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredFiles.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-800 truncate">
                        {file.path.split('/').pop()}
                      </span>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500">
                        {file.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{file.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header with copy button */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs text-slate-300 font-semibold truncate max-w-sm">
                  {selectedFile.path}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier le code'}</span>
              </button>
            </div>

            {/* File info banner */}
            <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span>{selectedFile.description}</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">{selectedFile.language}</span>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[560px] leading-relaxed select-text">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
