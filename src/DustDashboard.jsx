import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Papa from "papaparse";

function DustDashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDust = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_DUST_DATA_URL, {
          responseType: "arraybuffer",
        });

        const decoder = new TextDecoder("euc-kr");
        const csvText = decoder.decode(response.data);

        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().replace(/^\uFEFF/, ""),
        });

        const data = parsed.data
          .map((row) => {
            const values = Object.values(row);

            return {
              date: values[0],
              station: values[1],
              pm10: values[2],
              pm25: values[3],
            };
          })
          .filter((item) => item.date && item.station && item.pm10)
          .slice(0, 12);

        setItems(data);
      } catch (err) {
        console.error(err);
        setError("데이터를 불러오지 못했습니다.");
      }
    };

    fetchDust();
  }, []);

  const averagePm10 = useMemo(() => {
    if (items.length === 0) return 0;

    const total = items.reduce((sum, item) => {
      return sum + Number(item.pm10 || 0);
    }, 0);

    return Math.round(total / items.length);
  }, [items]);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-emerald-600">
          서울특별시 공공데이터
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          서울시 시간별 미세먼지 데이터
        </h1>

        <p className="mt-3 text-slate-600">
          axios와 useEffect로 CSV 데이터를 불러오고, Tailwind CSS로 화면을 꾸몄습니다.
        </p>

        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-slate-500">최근 데이터 평균 미세먼지</p>
          <p className="mt-2 text-4xl font-bold text-emerald-600">
            {averagePm10} ㎍/㎥
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={index} className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-slate-500">{item.date}</p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {item.station}
              </h2>

              <div className="mt-4 flex justify-between gap-4">
                <p className="font-semibold text-blue-600">
                  미세먼지 {item.pm10}
                </p>
                <p className="font-semibold text-purple-600">
                  초미세먼지 {item.pm25}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DustDashboard;