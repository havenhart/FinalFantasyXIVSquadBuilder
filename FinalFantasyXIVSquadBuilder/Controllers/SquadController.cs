using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FinalFantasyXIVSquadBuilder.Lib.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft;

namespace FinalFantasyXIVSquadBuilder.WebUI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SquadController : ControllerBase
    {
        [HttpGet]
        [Route("Roster")]
        public async Task<JsonResult> GetSquadRoster()
        {
            return new JsonResult(await Queries.GetBaseSquadValues());
        }

        [HttpGet]
        [Route("Attributes")]
        public async Task<JsonResult> GetSquadAttributes()
        {
            return new JsonResult(await Queries.GetAttributeValues());
        }
    }
}