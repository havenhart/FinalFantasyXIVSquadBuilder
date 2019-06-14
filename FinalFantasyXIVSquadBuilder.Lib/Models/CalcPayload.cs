using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Models
{
    public class CalcPayload
    {
        public List<SquadMember> Members { get; set; } = new List<SquadMember>();
        public List<StatRecord> Attributes { get; set; } = new List<StatRecord>();
    }
}
