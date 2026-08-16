import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useAnimation, useInView } from 'motion/react';
import { Users, CreditCard, CheckCircle, Heart } from 'lucide-react';

const CountUp = ({ to, duration = 2 }: { to: number | string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const target = typeof to === 'string' ? parseFloat(to.replace(/[^0-9.]/g, '')) || 0 : to;
      const increment = target / (duration * 60);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      
      return () => clearInterval(timer);
    }
  }, [to, duration, isInView]);

  const target = typeof to === 'string' ? parseFloat(to.replace(/[^0-9.]/g, '')) || 0 : to;
  const displayString = typeof to === 'string' ? to.replace(/[0-9.]+/g, count.toString()) : count.toString();
  
  return <span ref={ref}>{displayString}{typeof to === 'number' && count === target ? '+' : ''}</span>;
};

export default function LiveStats() {
  const { data } = useQuery({
    queryKey: ['public-platform-stats'],
    queryFn: async () => {
      const res = await fetch('/api/public/platform-stats');
      const data = await res.json();
      return data;
    },
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  const stats = [
    {
      id: 1,
      name: 'Total Contributors',
      value: data?.totalContributors || 0,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-100'
    },
    {
      id: 2,
      name: 'Hours Delivered',
      value: '5000+',
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Platform Impact</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our growing community is making a real difference in the world of embodied AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center hover:-translate-y-1 transition-transform w-full sm:w-1/2"
              >
                <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2 font-display">
                  {typeof stat.value === 'string' && stat.value.includes('+') ? (
                    <CountUp to={stat.value.replace('+', '')} />
                  ) : (
                    <CountUp to={stat.value} />
                  )}
                  {typeof stat.value === 'string' && stat.value.includes('+') && '+'}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.name}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
