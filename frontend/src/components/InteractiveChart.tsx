"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface ChartData {
  time: string;
  price: number;
  volume: number;
  change: number;
}

const generateMockData = (): ChartData[] => {
  const data: ChartData[] = [];
  let price = 100;

  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.5) * 10;
    price += change;
    data.push({
      time: `${String(i).padStart(2, "0")}:00`,
      price: Math.max(price, 80),
      volume: Math.random() * 1000000,
      change: change,
    });
  }
  return data;
};

export function InteractiveChart() {
  const [data, setData] = useState<ChartData[]>(generateMockData());
  const [selectedPeriod, setSelectedPeriod] = useState("24H");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData];
        const lastPrice = newData[newData.length - 1].price;
        const change = (Math.random() - 0.5) * 5;

        newData.shift(); // Remove first element
        newData.push({
          time: new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: Math.max(lastPrice + change, 80),
          volume: Math.random() * 1000000,
          change: change,
        });

        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const maxPrice = Math.max(...data.map((d) => d.price));
  const minPrice = Math.min(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  const maxVolume = Math.max(...data.map((d) => d.volume));

  const latestData = data[data.length - 1];
  const priceChange = latestData.price - data[0].price;
  const priceChangePercent = (priceChange / data[0].price) * 100;

  return (
    <motion.div
      className="relative bg-gradient-to-br from-slate-900/50 via-black/40 to-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden group"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-400" />
            AVAX/USDC Price Chart
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-white">
              ${latestData.price.toFixed(2)}
            </span>
            <motion.span
              className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                priceChange >= 0
                  ? "text-emerald-400 bg-emerald-500/20"
                  : "text-red-400 bg-red-500/20"
              }`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {priceChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {priceChangePercent.toFixed(2)}%
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-black/20 rounded-lg p-1">
            {["1H", "24H", "7D"].map((period) => (
              <motion.button
                key={period}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  selectedPeriod === period
                    ? "bg-red-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedPeriod(period)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period}
              </motion.button>
            ))}
          </div>

          {/* Live indicator */}
          <motion.button
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isLive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
            }`}
            onClick={() => setIsLive(!isLive)}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${
                isLive ? "bg-emerald-400" : "bg-gray-400"
              }`}
              animate={
                isLive ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}
              }
              transition={{ duration: 1, repeat: Infinity }}
            />
            {isLive ? "Live" : "Paused"}
          </motion.button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-48 mb-4">
        <svg className="w-full h-full" viewBox="0 0 400 192">
          {/* Grid lines */}
          <defs>
            <linearGradient
              id="priceGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.5"
              />
              <stop
                offset="100%"
                stopColor="rgb(59, 130, 246)"
                stopOpacity="0.1"
              />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.line
              key={`grid-${i}`}
              x1="0"
              y1={i * 48}
              x2="400"
              y2={i * 48}
              stroke="rgb(255,255,255)"
              strokeOpacity="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          ))}

          {/* Volume bars */}
          {data.map((point, index) => (
            <motion.rect
              key={`volume-${index}`}
              x={index * (400 / data.length)}
              y={192 - (point.volume / maxVolume) * 40}
              width={400 / data.length - 2}
              height={(point.volume / maxVolume) * 40}
              fill="rgba(59, 130, 246, 0.2)"
              initial={{ height: 0, y: 192 }}
              animate={{
                height: (point.volume / maxVolume) * 40,
                y: 192 - (point.volume / maxVolume) * 40,
              }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
            />
          ))}

          {/* Price area */}
          <motion.path
            d={`M 0 ${
              192 - ((data[0].price - minPrice) / priceRange) * 140
            } ${data
              .map(
                (point, index) =>
                  `L ${index * (400 / data.length)} ${
                    192 - ((point.price - minPrice) / priceRange) * 140
                  }`
              )
              .join(" ")} L 400 192 L 0 192 Z`}
            fill="url(#priceGradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Price line */}
          <motion.path
            d={`M 0 ${
              192 - ((data[0].price - minPrice) / priceRange) * 140
            } ${data
              .map(
                (point, index) =>
                  `L ${index * (400 / data.length)} ${
                    192 - ((point.price - minPrice) / priceRange) * 140
                  }`
              )
              .join(" ")}`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Data points */}
          {data.map((point, index) => (
            <motion.circle
              key={`point-${index}`}
              cx={index * (400 / data.length)}
              cy={192 - ((point.price - minPrice) / priceRange) * 140}
              r={hoveredIndex === index ? 4 : 2}
              fill="rgb(59, 130, 246)"
              className="cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.5, fill: "rgb(34, 197, 94)" }}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <motion.div
            className="absolute bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-xs text-white z-10"
            style={{
              left: `${(hoveredIndex / data.length) * 100}%`,
              top: `${
                100 - ((data[hoveredIndex].price - minPrice) / priceRange) * 70
              }%`,
              transform: "translate(-50%, -100%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="font-medium">
              ${data[hoveredIndex].price.toFixed(2)}
            </div>
            <div className="text-gray-400">{data[hoveredIndex].time}</div>
            <div className="text-gray-400">
              Vol: {(data[hoveredIndex].volume / 1000).toFixed(0)}K
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <motion.div
          className="p-3 bg-black/20 rounded-lg"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="text-xs text-gray-400 mb-1">24h High</div>
          <div className="text-sm font-semibold text-emerald-400">
            ${maxPrice.toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          className="p-3 bg-black/20 rounded-lg"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <div className="text-xs text-gray-400 mb-1">24h Low</div>
          <div className="text-sm font-semibold text-red-400">
            ${minPrice.toFixed(2)}
          </div>
        </motion.div>

        <motion.div
          className="p-3 bg-black/20 rounded-lg"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className="text-xs text-gray-400 mb-1">24h Volume</div>
          <div className="text-sm font-semibold text-white">
            ${(data.reduce((sum, d) => sum + d.volume, 0) / 1000000).toFixed(1)}
            M
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
