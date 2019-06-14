using FinalFantasyXIVSquadBuilder.Lib.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Models
{
    public class StatRecord : IStatRecord
    {
        public string Name { get; set; }
        public int Physical { get; set; }
        public int Mental { get; set; }
        public int Tactical { get; set; }
    }
}
