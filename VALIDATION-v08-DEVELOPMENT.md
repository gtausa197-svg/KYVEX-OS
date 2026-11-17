# KYVEX Native — перевірений стан API, 2026-11-04

Усі чотири запитані зміни реалізовано у Native та перевірено справжнім APK
для ARM32 і ARM64 під seccomp:

- `ApplicationInfo.dataDir`: публічне поле String читається/змінюється через
  DEX та рефлексію. Context повертає відомості зі справжнім приватним каталогом
  гостя. Зміна поля не дає доступу до файлової системи хоста.
- `Activity/Context.getPackageManager()`: стабільний об'єкт для поточного APK;
  версія, SDK і PackageInfo/ApplicationInfo отримуються з маніфесту.
  Відсутні пакети дають NameNotFoundException.
- `Thread.<init>()`: окрема назва та ID, стан ще не запущеного потоку,
  успадкування пріоритету, daemon. `run()` виконує Runnable синхронно.
  **Thread.start і справжній планувальник потоків ще не реалізовані.**
- `Class.getDeclaredField(String)`: пошук у власних полях класу, без пошуку
  в батьків; Field підтримує перевірений набір читання/запису, типів і прапорців
  доступу. Відсутні поля дають NoSuchFieldException.

Після повторного запуску додано наступні потрібні операції:

- Типізовані `ApplicationInfo.metaData` з розділу application маніфесту:
  String, int, bool, float та ID ресурсу. Дані activity не потрапляють у Bundle
  application; запити PackageManager враховують GET_META_DATA. Значення
  android:value, що посилаються на ресурс, потребують подальшої реалізації
  таблиць ресурсів і відхиляються при спробі читання.
- `String.split` і `Pattern.split`: додатні/від'ємні ліміти, початкові й кінцеві
  порожні частини, UTF-16 для порожнього шаблону, обмежений розмір результату.
  Граничні випадки звірено зі звичайною Java: samples/oracles/SplitOracle.java.
  Додано contentEquals для підтриманих String і StringBuilder/StringBuffer.
- `CountDownLatch`: конструктор, справжній лічильник, countDown до нуля,
  негайне await при нулі та перевірка нульового таймауту. Ненульове блокувальне
  очікування поки явно відхиляється, бо потребує планувальника.
- `Class.getDeclaredConstructor` і перевірений набір Constructor.newInstance:
  виконуються справжні DEX або підтримані Native-конструктори. Параметри
  перевіряються, Java-винятки обгортаються в InvocationTargetException зі
  збереженням причини. Абстрактні класи та enum не створюються. Зовнішній mutex
  синхронізованих колекцій зберігається й утримується збиранням сміття.

Пройшли **141 автоматичний тест**: 70 Rust (16 core,
48 Native, 6 APK), 40 Python, 12 Node, 15 тестів процесів і 4 тести Android API.
Останні виконують 10 окремих процесів: ARM32/ARM64, 19 перевірок платформи,
20 файлових перевірок, 49 перевірок розширених API, черга подій, збереження
налаштувань і JNI. Пройшли Clippy, Qt smoke та справжній цикл подій Studio
з відкладеним оновленням вікна. Модель незміненої сцени не перевідтворюється.
Маніфест bridge APK перевірено aapt2, підпис — jarsigner.

Повторно виконано всі п'ять незмінених APK із D:/apk. Пройдено попередні
відсутні API; кожна програма зупиняється на наступній непідтриманій операції.
**Початковий інтерфейс користувацьких програм: 0/5. Фото їхніх робочих
вікон ще немає; повна мета не завершена.** Таймаутів та аварійних завершень
від сигналів у цьому прогоні немає.

Поточні перші перешкоди:

- **Mobile+Legends_+Bang+Bang+VNG_1.8.47.9191_APKPure.apk**: `Lcom/moba/unityplugin/MobaGameMainActivityWithExtractor;->onCreate(Landroid/os/Bundle;)V: Lcom/moba/unityplugin/AppInfo;->InitActivity(Landroid/app/Activity;Z)V: Ljava/util/UUID;->randomUUID()Ljava/util/UUID;: Unsupported Android/Java API Ljava/util/UUID;->randomUUID()Ljava/util/UUID;`

- **Reddit_2024.17.0_APKPure.apk**: `Java exception Ljava/lang/IllegalStateException;: Default FirebaseApp is not initialized in this process com.reddit.frontpage. Make sure to call FirebaseApp.initializeApp(Context) first.`

- **Subway+Surfers_3.71.0_APKPure.apk**: `Lcom/sybogames/chili/multidex/ChiliMultidexSupportActivity;->onCreate(Landroid/os/Bundle;)V: Lcom/google/firebase/MessagingUnityPlayerActivity;->onCreate(Landroid/os/Bundle;)V: Lcom/unity3d/player/UnityPlayerActivity;->onCreate(Landroid/os/Bundle;)V: Lcom/unity3d/player/UnityPlayer;-><init>(Landroid/content/Context;Lcom/unity3d/player/IUnityPlayerLifecycleEvents;)V: Lcom/unity3d/player/T0;-><init>(Lcom/unity3d/player/UnityPlayer;Lcom/unity3d/player/l1;)V: Lcom/unity3d/player/T0;-><init>(Lcom/unity3d/player/UnityPlayer;)V: Landroid/telephony/PhoneStateListener;-><init>()V: Unsupported Android/Java API Landroid/telephony/PhoneStateListener;-><init>()V`

- **Telegram_11.2.1_APKPure.apk**: `Lorg/telegram/ui/LaunchActivity;-><init>()V: Unsupported Android/Java class Landroid/util/SparseIntArray;`

- **TikTok+-+Videos,+Shop+&+LIVE_47.6.3_APKPure.apk**: `Lcom/ss/android/ugc/aweme/app/host/AwemeHostApplication;-><init>()V: LX/02os;->LIZIZ(Landroid/content/Context;)Ljava/lang/String;: LX/02os;->LIZ(Landroid/content/Context;)Ljava/lang/String;: Landroid/os/Process;->myPid()I: Unsupported Android/Java API Landroid/os/Process;->myPid()I`

Докази: corpus-latest.json, native-api-tests.json, rust-tests.log,
native-worker-tests.log, qt-event-test.json, bridge-manifest-tree.txt,
bridge-apk-signature.txt. SHA256 робітника: `e86443d7cb9e4e058197e6bdb68c23aacc0ee3b1c676382d241e1920a84dd9e8`.

Відтворення: build-dev.sh, rebuild-api-fixtures.sh, check-current.sh,
record-api-snapshot.py. Старі record-progress.py/record-snapshot.py описують
попередні знімки та не повинні перезаписувати поточний звіт.

Зміни у D:/KYVEX-OS/source та перевіреному Linux Builder. Новий ISO не зібрано;
нової перевірки Live або фізичної RTX 5070 не було. Реліз 0.7 збережено.
Звичайні файли Native досі тимчасові; SharedPreferences зберігаються в журналі.
Повного ART/Framework, ресурсів, Java/Bionic потоків, JNI-викликів Java та
графічного мосту Unity/GLES ще немає. Тести власних APK не є сертифікацією
користувацьких програм.
