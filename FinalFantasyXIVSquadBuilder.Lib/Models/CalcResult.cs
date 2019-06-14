using FinalFantasyXIVSquadBuilder.Lib.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Models
{
    public class CalcResult : ICalcResult
    {
        public int Member1 { get; private set; }
        public int Member2 { get; private set; }
        public int Member3 { get; private set; }
        public int Member4 { get; private set; }
        public string Training { get; private set; }
        public StatRecord CalcTotals { get; private set; }

        public CalcResult(int member1, int member2, int member3, int member4, string training, StatRecord totals)
        {
            Member1 = member1;
            Member2 = member2;
            Member3 = member3;
            Member4 = member4;
            Training = training;
            CalcTotals = totals;
        }
    }
}
