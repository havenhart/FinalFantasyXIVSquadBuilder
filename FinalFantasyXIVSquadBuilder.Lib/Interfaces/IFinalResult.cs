using FinalFantasyXIVSquadBuilder.Lib.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Interfaces
{
    public interface IFinalResult
    {
        StatRecord CalcTotals { get; }
    }
}
