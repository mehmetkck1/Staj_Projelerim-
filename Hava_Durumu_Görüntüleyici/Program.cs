var havaDurumlari = new List<HavaDurumu>
{
    new("Istanbul", 24, "Parcali bulutlu", 62, 14),
    new("Ankara", 22, "Gunesli", 38, 10),
    new("Izmir", 28, "Acik", 52, 16),
    new("Antalya", 31, "Gunesli", 58, 12),
    new("Trabzon", 20, "Yagmurlu", 78, 18)
};

Console.WriteLine("Hava Durumu Goruntuleyici");
Console.WriteLine("-------------------------");

for (var i = 0; i < havaDurumlari.Count; i++)
{
    Console.WriteLine($"{i + 1}. {havaDurumlari[i].Sehir}");
}

Console.WriteLine();
Console.Write("Hava durumunu gormek istediginiz sehrin numarasini girin: ");
var giris = Console.ReadLine();

if (!int.TryParse(giris, out var secim) || secim < 1 || secim > havaDurumlari.Count)
{
    Console.WriteLine("Gecersiz secim yaptiniz.");
    return;
}

var havaDurumu = havaDurumlari[secim - 1];

Console.WriteLine();
Console.WriteLine($"{havaDurumu.Sehir} Hava Durumu");
Console.WriteLine("--------------------");
Console.WriteLine($"Sicaklik : {havaDurumu.Sicaklik} C");
Console.WriteLine($"Durum    : {havaDurumu.Durum}");
Console.WriteLine($"Nem      : %{havaDurumu.Nem}");
Console.WriteLine($"Ruzgar   : {havaDurumu.RuzgarHizi} km/sa");

record HavaDurumu(
    string Sehir,
    int Sicaklik,
    string Durum,
    int Nem,
    int RuzgarHizi);
