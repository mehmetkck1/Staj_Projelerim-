#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sqlite3

DB_PATH = "students.db"  # veritabanı dosyası

def get_connection(path=DB_PATH):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn

def create_table():
    sql = """
    CREATE TABLE IF NOT EXISTS öğrenciler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isim TEXT NOT NULL,
        soyisim TEXT NOT NULL,
        sinif TEXT,
        yas INTEGER
    );
    """
    conn = get_connection()
    try:
        conn.execute(sql)
        conn.commit()
    finally:
        conn.close()

def add_student(isim, soyisim, sinif=None, yas=None):
    sql = "INSERT INTO öğrenciler (isim, soyisim, sinif, yas) VALUES (?, ?, ?, ?)"
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, (isim, soyisim, sinif, yas))
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

def list_students():
    sql = "SELECT * FROM öğrenciler ORDER BY id"
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    finally:
        conn.close()

def find_student(student_id):
    sql = "SELECT * FROM öğrenciler WHERE id = ?"
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, (student_id,))
        return cur.fetchone()
    finally:
        conn.close()

def update_student(student_id, isim=None, soyisim=None, sinif=None, yas=None):
    # Dinamik güncelleme: yalnızca girilen alanları günceller
    updates = []
    params = []
    if isim is not None:
        updates.append("isim = ?"); params.append(isim)
    if soyisim is not None:
        updates.append("soyisim = ?"); params.append(soyisim)
    if sinif is not None:
        updates.append("sinif = ?"); params.append(sinif)
    if yas is not None:
        updates.append("yas = ?"); params.append(yas)

    if not updates:
        return False

    params.append(student_id)
    sql = f"UPDATE öğrenciler SET {', '.join(updates)} WHERE id = ?"
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

def delete_student(student_id):
    sql = "DELETE FROM öğrenciler WHERE id = ?"
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, (student_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

# -------------------------
# Konsol arayüzü
# -------------------------
def input_int(prompt, allow_empty=False):
    while True:
        s = input(prompt).strip()
        if s == "" and allow_empty:
            return None
        try:
            return int(s)
        except ValueError:
            print("Lütfen geçerli bir sayı girin veya boş bırakın.")

def main_menu():
    create_table()
    while True:
        print("\n--- ÖĞRENCİ YÖNETİMİ ---")
        print("1) Öğrenci Ekle")
        print("2) Öğrencileri Listele")
        print("3) Öğrenci Güncelle")
        print("4) Öğrenci Sil")
        print("5) Detay Göster (ID ile)")
        print("0) Çıkış")
        choice = input("Seçiminiz: ").strip()

        if choice == "1":
            isim = input("İsim: ").strip()
            soyisim = input("Soyisim: ").strip()
            sinif = input("Sınıf (opsiyonel): ").strip() or None
            yas = input_int("Yaş (opsiyonel): ", allow_empty=True)
            if not isim or not soyisim:
                print("İsim ve soyisim boş olamaz.")
                continue
            new_id = add_student(isim, soyisim, sinif, yas)
            print(f"Öğrenci eklendi. ID: {new_id}")

        elif choice == "2":
            rows = list_students()
            if not rows:
                print("Kayıtlı öğrenci yok.")
            else:
                print(f"\nToplam {len(rows)} öğrenci:")
                print("{:<4} {:<15} {:<15} {:<8} {:<4}".format("ID", "İsim", "Soyisim", "Sınıf", "Yaş"))
                print("-"*52)
                for r in rows:
                    print("{:<4} {:<15} {:<15} {:<8} {:<4}".format(
                        r["id"], r["isim"], r["soyisim"], r["sinif"] or "-", r["yas"] if r["yas"] is not None else "-"
                    ))

        elif choice == "3":
            sid = input_int("Güncellenecek öğrenci ID: ")
            existing = find_student(sid)
            if not existing:
                print("Öğrenci bulunamadı.")
                continue
            print("Mevcut (boş bırakırsanız değiştirmez):")
            print(f"İsim: {existing['isim']}, Soyisim: {existing['soyisim']}, Sınıf: {existing['sinif']}, Yaş: {existing['yas']}")
            isim = input("Yeni isim: ").strip() or None
            soyisim = input("Yeni soyisim: ").strip() or None
            sinif = input("Yeni sınıf: ").strip() or None
            yas = input("Yeni yaş: ").strip()
            yas_val = None
            if yas != "":
                try:
                    yas_val = int(yas)
                except ValueError:
                    print("Yaş sayısal olmalı. Güncelleme iptal.")
                    continue
            success = update_student(sid, isim=isim, soyisim=soyisim, sinif=sinif, yas=yas_val)
            print("Güncelleme başarılı." if success else "Güncelleme yapılamadı.")

        elif choice == "4":
            sid = input_int("Silinecek öğrenci ID: ")
            existing = find_student(sid)
            if not existing:
                print("Öğrenci bulunamadı.")
                continue
            confirm = input(f"{existing['isim']} {existing['soyisim']} kaydını silmek istediğinize emin misiniz? (E/h): ").strip().lower()
            if confirm == "e":
                ok = delete_student(sid)
                print("Silindi." if ok else "Silme başarısız.")
            else:
                print("Silme iptal edildi.")

        elif choice == "5":
            sid = input_int("Gösterilecek öğrenci ID: ")
            r = find_student(sid)
            if not r:
                print("Öğrenci bulunamadı.")
            else:
                print("\n--- Öğrenci Detayı ---")
                print(f"ID     : {r['id']}")
                print(f"İsim   : {r['isim']}")
                print(f"Soyisim: {r['soyisim']}")
                print(f"Sınıf  : {r['sinif']}")
                print(f"Yaş    : {r['yas']}")

        elif choice == "0":
            print("Çıkılıyor...")
            break
        else:
            print("Geçersiz seçim. Tekrar deneyin.")

if __name__ == "__main__":
    main_menu()
    