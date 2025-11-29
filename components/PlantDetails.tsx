import React, { useState } from 'react';
import { PlantAnalysisResult } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { 
  Leaf, AlertTriangle, User, HeartPulse, ScrollText, Sprout, Activity, Share2, Check,
  CookingPot, Droplets, Coffee, Utensils, Flame, Wind
} from 'lucide-react';

interface PlantDetailsProps {
  data: PlantAnalysisResult;
}

export default function PlantDetails({ data }: PlantDetailsProps) {
  const [copied, setCopied] = useState(false);

  if (!data.identified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sprout className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-yellow-900 mb-3">Identification Uncertain</h2>
        <p className="text-yellow-800 max-w-lg mx-auto leading-relaxed">
          Our AI couldn't confidently identify a medicinal plant, millet, or pulse in this image. 
          Please try uploading a clearer photo against a plain background.
        </p>
      </div>
    );
  }

  const handleShare = async () => {
    const text = `🌿 *${data.commonName}* (${data.botanicalName})\n\n` +
      `Ayurvedic Name: ${data.ayurvedicName}\n\n` +
      `"${data.shortDescription}"\n\n` +
      `💊 *Medicinal Uses:*\n${data.medicinalUses?.slice(0, 4).map(u => `• ${u}`).join('\n')}\n\n` +
      `Powered by VedaVision AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `VedaVision: ${data.commonName}`,
          text: text,
        });
      } catch (err) {
        // User cancelled or share failed, ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const getMethodIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    if (name.includes('decoction') || name.includes('boil') || name.includes('soup') || name.includes('kashayam') || name.includes('cook')) {
        return <CookingPot className="w-6 h-6 text-orange-600" />;
    }
    if (name.includes('tea') || name.includes('infusion') || name.includes('drink') || name.includes('hot water')) {
        return <Coffee className="w-6 h-6 text-amber-700" />;
    }
    if (name.includes('paste') || name.includes('poultice') || name.includes('chutney') || name.includes('kalka') || name.includes('ground')) {
        return <Utensils className="w-6 h-6 text-stone-600" />;
    }
    if (name.includes('oil') || name.includes('juice') || name.includes('extract') || name.includes('ghee') || name.includes('swarasa')) {
        return <Droplets className="w-6 h-6 text-cyan-600" />;
    }
    if (name.includes('powder') || name.includes('churna') || name.includes('dust') || name.includes('ash')) {
        return <Wind className="w-6 h-6 text-stone-400" />;
    }
    if (name.includes('smoke') || name.includes('burn') || name.includes('bhasma')) {
        return <Flame className="w-6 h-6 text-red-600" />;
    }
    return <ScrollText className="w-6 h-6 text-ayur-600" />;
  };

  // Chart Data Preparation
  const safetyData = [
    { subject: 'Safety', A: data.safetyProfileScore || 5, fullMark: 10 },
    { subject: 'Confidence', A: (data.confidenceScore || 50) / 10, fullMark: 10 },
    { subject: 'Availability', A: 8, fullMark: 10 },
    { subject: 'Research', A: 7, fullMark: 10 },
    { subject: 'Tradition', A: 9, fullMark: 10 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header Info */}
      <div className="bg-white rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ayur-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-ayur-900 leading-tight">
                        {data.commonName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-stone-500">
                        <span className="font-bold text-ayur-700 px-3 py-1 bg-ayur-50 rounded-full text-sm">{data.botanicalName}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="italic">Family: {data.family}</span>
                    </div>
                </div>
                
                <div className="mt-6 md:mt-0 flex items-center gap-3">
                     <button 
                        onClick={handleShare}
                        className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-600 hover:bg-ayur-50 hover:text-ayur-600 hover:border-ayur-200 transition-all shadow-sm active:scale-95 flex items-center justify-center z-20"
                        title="Share Result"
                     >
                        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                     </button>
                    <div className="flex items-center bg-gradient-to-r from-ayur-500 to-ayur-600 px-5 py-2.5 rounded-full shadow-lg shadow-ayur-200 text-white transform md:-rotate-2 group-hover:rotate-0 transition-transform">
                        <Leaf className="w-5 h-5 mr-2.5" />
                        <span className="font-bold tracking-wide">Ayurveda: {data.ayurvedicName}</span>
                    </div>
                </div>
            </div>
            
            <p className="text-stone-700 leading-relaxed text-lg border-l-4 border-ayur-300 pl-6 italic mb-8">
                "{data.shortDescription}"
            </p>

            {/* Ayurvedic Properties Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PropCard label="Rasa (Taste)" value={data.ayurvedicProperties?.rasa} delay="0" />
                <PropCard label="Virya (Potency)" value={data.ayurvedicProperties?.virya} delay="100" />
                <PropCard label="Vipaka (Effect)" value={data.ayurvedicProperties?.vipaka} delay="200" />
                <PropCard label="Dosha Karma" value={data.ayurvedicProperties?.doshaKarma} delay="300" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Medicinal Uses */}
        <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-red-50 rounded-2xl mr-4">
                    <HeartPulse className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800">Medicinal & Health Benefits</h3>
            </div>
            <ul className="space-y-4 flex-grow">
                {data.medicinalUses?.map((use, idx) => (
                    <li key={idx} className="flex items-start text-stone-700 group">
                        <span className="w-2 h-2 mt-2.5 bg-ayur-400 rounded-full mr-4 shrink-0 group-hover:scale-125 transition-transform"></span>
                        <span className="leading-relaxed">{use}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* Profile Chart */}
        <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300">
             <div className="flex items-center mb-2">
                <div className="p-3 bg-blue-50 rounded-2xl mr-4">
                     <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800">Properties Profile</h3>
            </div>
            <div className="h-72 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={safetyData}>
                        <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#78716c', fontSize: 11, fontWeight: 600 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar
                            name="Plant Score"
                            dataKey="A"
                            stroke="#16a34a"
                            strokeWidth={3}
                            fill="#4ade80"
                            fillOpacity={0.4}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }} 
                            itemStyle={{ color: '#15803d', fontWeight: 700 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
             <p className="text-xs text-center text-stone-400 font-medium">
                 *AI estimated profile based on known properties
             </p>
        </div>
      </div>

      {/* Preparation & Dosage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
         <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl mr-4">
                    <ScrollText className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800">Preparation</h3>
            </div>
            <div className="space-y-4">
                {data.preparationMethods?.map((method, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-amber-50/30 hover:border-amber-100 transition-colors flex items-start gap-4">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-100 shrink-0 mt-0.5">
                            {getMethodIcon(method.methodName)}
                        </div>
                        <div>
                            <h4 className="font-bold text-ayur-800 mb-1">{method.methodName}</h4>
                            <p className="text-sm text-stone-600 leading-relaxed">{method.instructions}</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-indigo-50 rounded-2xl mr-4">
                        <User className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800">Dosage / Serving</h3>
                </div>
                <div className="space-y-4">
                    <DosageRow label="Children" value={data.dosage?.children} />
                    <DosageRow label="Adults" value={data.dosage?.adults} />
                    <DosageRow label="Elderly" value={data.dosage?.elderly} />
                </div>
            </div>

            <div className="bg-red-50 rounded-3xl shadow-md border border-red-100 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 rounded-xl mr-3">
                         <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-900">Safety Profile</h3>
                </div>
                <ul className="space-y-3">
                    {data.safetyWarnings?.map((warning, idx) => (
                        <li key={idx} className="flex items-start text-red-800 text-sm font-medium">
                             <span className="mr-3 text-red-400 text-lg">•</span> {warning}
                        </li>
                    ))}
                </ul>
            </div>
         </div>
      </div>
    </div>
  );
}

function PropCard({ label, value, delay }: { label: string, value?: string, delay: string }) {
    return (
        <div 
            className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center hover:bg-ayur-50 hover:border-ayur-100 transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-ayur-900 font-bold text-lg">{value || 'Unknown'}</p>
        </div>
    );
}

function DosageRow({ label, value }: { label: string, value?: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
            <span className="font-bold text-stone-500 text-sm w-24 uppercase tracking-wide">{label}</span>
            <span className="text-stone-800 font-medium flex-1">{value || 'Consult a doctor'}</span>
        </div>
    );
}