using System;
using System.Collections.Generic;
using System.Text;

namespace FinalFantasyXIVSquadBuilder.Lib.Models
{
    public class SquadMember
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int Physical { get; set; }
        public int Mental { get; set; }
        public int Tactical { get; set; }
        public bool Selected { get; set; }
        public bool Active { get; set; }
    }
}
