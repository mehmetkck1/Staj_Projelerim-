using System.Globalization;

List<Islem> islemler = new();
CultureInfo.CurrentCulture = new CultureInfo("tr-TR");

while (true)
{
    Console.Clear();
    Console.WriteLine("=== Butce Takip Sistemi ===");
    Console.WriteLine("1 - Gelir ekle");
    Console.WriteLine("2 - Gider ekle");
    Console.WriteLine("3 - Tum kayitlari listele");
    Console.WriteLine("4 - Rapor goster");
    Console.WriteLine("5 - Cikis");
    Console.Write("Seciminiz: ");

    string? secim = Console.ReadLine();

    switch (secim)
    {
        case "1":
            IslemEkle(islemler, "Gelir");
            break;
        case "2":
            IslemEkle(islemler, "Gider");
            break;
        case "3":
            KayitlariListele(islemler);
            break;
        case "4":
            RaporGoster(islemler);
            break;
        case "5":
            Console.WriteLine("Program kapatiliyor...");
            return;
        default:
            Console.WriteLine("Hatali secim yaptiniz.");
            DevamEt();
            break;
    }
}

static void IslemEkle(List<Islem> islemler, string tur)
{
    Console.Clear();
    Console.WriteLine($"=== {tur} Ekle ===");

    Console.Write("Aciklama: ");
    string aciklama = Console.ReadLine() ?? "";

    decimal tutar = TutarOku("Tutar: ");

    islemler.Add(new Islem
    {
        Tur = tur,
        Aciklama = aciklama,
        Tutar = tutar,
        Tarih = DateTime.Now
    });

    Console.WriteLine($"{tur} kaydi basariyla eklendi.");
    DevamEt();
}

static decimal TutarOku(string mesaj)
{
    while (true)
    {
        Console.Write(mesaj);
        string? giris = Console.ReadLine();

        if (decimal.TryParse(giris, out decimal tutar) && tutar > 0)
        {
            return tutar;
        }

        Console.WriteLine("Lutfen sifirdan buyuk gecerli bir tutar girin.");
    }
}

static void KayitlariListele(List<Islem> islemler)
{
    Console.Clear();
    Console.WriteLine("=== Tum Kayitlar ===");

    if (islemler.Count == 0)
    {
        Console.WriteLine("Henuz kayit yok.");
        DevamEt();
        return;
    }

    foreach (Islem islem in islemler)
    {
        Console.WriteLine($"{islem.Tarih:dd.MM.yyyy HH:mm} | {islem.Tur,-5} | {islem.Aciklama,-20} | {islem.Tutar:C}");
    }

    DevamEt();
}

static void RaporGoster(List<Islem> islemler)
{
    Console.Clear();
    Console.WriteLine("=== Butce Raporu ===");

    decimal toplamGelir = islemler
        .Where(islem => islem.Tur == "Gelir")
        .Sum(islem => islem.Tutar);

    decimal toplamGider = islemler
        .Where(islem => islem.Tur == "Gider")
        .Sum(islem => islem.Tutar);

    decimal kalanButce = toplamGelir - toplamGider;

    Console.WriteLine($"Toplam Gelir : {toplamGelir:C}");
    Console.WriteLine($"Toplam Gider : {toplamGider:C}");
    Console.WriteLine($"Kalan Butce  : {kalanButce:C}");

    DevamEt();
}

static void DevamEt()
{
    Console.WriteLine();
    Console.Write("Devam etmek icin Enter'a basin...");
    Console.ReadLine();
}

class Islem
{
    public string Tur { get; set; } = "";
    public string Aciklama { get; set; } = "";
    public decimal Tutar { get; set; }
    public DateTime Tarih { get; set; }
}
