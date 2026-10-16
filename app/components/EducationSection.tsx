'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { REPORT_METADATA } from '../data/reportData';
import { IMAGES } from '../assets/images';

export const EducationSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-22%', '0%'], { clamp: true });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-16">
        {/* Headline */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Inspiring Young Nature Lovers
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.02] tracking-tight">
            Classrooms without ceilings inspire London’s future ecologists.
          </h2>
          <p className="text-lg sm:text-xl text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            By installing safe observation viewports on school rooftops, students across Hammersmith and Camden study colony genetics and botany in living laboratories.
          </p>
        </div>

        {/* Visual & Education Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Metrics Column - Cards slide in from left */}
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-[#243723] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400"
            >
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                {REPORT_METADATA.attendees.toLocaleString('en-GB')}
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Youth & Community Attendees</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Primary and secondary school students participating in immersive, accredited pollination workshops.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-[#243723] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400"
            >
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                {REPORT_METADATA.fieldTrips.toLocaleString('en-GB')}
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Rooftop Lab Field Trips</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Direct STEM experiences documenting pollen loads, nectar cycles, and microscope colony health analysis.
              </p>
            </motion.div>
          </div>

          {/* Image Column with Parallax Scroll */}
          <div className="lg:col-span-7 h-[440px] sm:h-[520px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-lg relative order-1 lg:order-2 bg-[#1F2B1D]">
            <motion.img
              style={{ y: imageY }}
              src={IMAGES.students}
              alt="Students observing a rooftop bee hive in sunlight"
              className="absolute top-0 left-0 w-full h-[135%] object-cover object-center max-w-none will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B1D]/80 via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-8 left-8 right-8 text-white z-20">
              <p className="font-display text-2xl sm:text-3xl font-light">
                “Students who struggled in conventional classrooms blossomed with hive tools in hand.”
              </p>
              <p className="text-xs text-white/80 font-light mt-1">
                — Biology Department Head, St. Jude’s Academy
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
